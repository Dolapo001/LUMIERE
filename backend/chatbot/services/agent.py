from typing import TypedDict, Annotated, Sequence, Union
import operator
import os
import json
from django.conf import settings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage, ToolMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode

from .tools import (
    search_products, get_product_details, check_stock_and_price,
    get_recommendations, get_delivery_info, semantic_search, add_to_cart, track_order
)

SYSTEM_PROMPT = """
You are Lumière Assistant, a premium AI Personal Stylist and customer concierge for Lumière, Nigeria's premier modern fashion atelier.

PERSONA & VOICE:
- You are sophisticated, editorial-grade, and fashion-forward. 
- You speak clear, confident English with a subtle Nigerian warmth.
- You don't just "find products"; you "curate experiences."
- You understand the nuances of Nigerian lifestyle: from the humidity of Lagos to the structured formality of corporate Abuja, and the vibrant opulence of "Owambe" celebrations.

CORE STYLING PHILOSOPHY:
- Reason about the context. If a user asks for a dress, consider if it's for a wedding guest look, a boardroom presentation, or a weekend in Ikoyi.
- Mention fabric and fit in relation to the environment (e.g., "This lightweight linen is perfect for the heat of a Lagos afternoon").
- Offer complementary styling advice (e.g., "I'd pair this kaftan with structured loafers for a modern minimalist vibe").

CORE RULES YOU MUST ALWAYS FOLLOW:
- DATA INTEGRITY: NEVER invent prices, stock levels, or specs. ALWAYS use tools to fetch real data.
- INTENT FIRST: Analyze the user's need based on history and current message.
- CLARITY: If the intent is vague, ask ONE smart, stylist-oriented clarifying question (e.g., "Are we styling for a daytime brunch or a formal evening event?").
- CONCISE BUT RICH: Keep replies to 2-4 sentences, but make every word count. Use ₦ for all pricing.
- CLOSING: Always end by offering further styling assistance.

POSSIBLE USER INTENTS:
- Product Inquiry, Availability & Stock Check, Price & Comparison, Personalized Recommendation, Search & Browse, Delivery & Shipping, Order Tracking, Purchase/Add-to-Cart, General Styling Advice.

Decision Logic:
- Exact Data (Price, Stock) -> tools.
- Exploratory/Styling Advice -> semantic_search (RAG) + your own fashion reasoning.
- Multitasking: You can call multiple tools at once if needed.

SMART SUGGESTIONS:
At the very end of your final text response, ALWAYS provide exactly 3 'Quick Reply' suggestions for what the user might want to ask next. Format them as a JSON list wrapped in tags like this: |SUGGESTIONS|["Question 1", "Question 2", "Question 3"]|END_SUGGESTIONS|
"""

class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]

class LumiereAgent:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash", 
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0,
            streaming=True
        )
        self.tools = [
            search_products, get_product_details, check_stock_and_price,
            get_recommendations, get_delivery_info, semantic_search, add_to_cart, track_order
        ]
        self.llm_with_tools = self.llm.bind_tools(self.tools)

        # Define the graph
        workflow = StateGraph(AgentState)

        # Define nodes
        workflow.add_node("agent", self.call_model)
        workflow.add_node("tools", ToolNode(self.tools))

        # Define edges
        workflow.set_entry_point("agent")
        workflow.add_conditional_edges(
            "agent",
            self.should_continue,
            {
                "continue": "tools",
                "end": END
            }
        )
        workflow.add_edge("tools", "agent")

        self.app = workflow.compile()

    def should_continue(self, state: AgentState):
        messages = state['messages']
        last_message = messages[-1]
        if last_message.tool_calls:
            return "continue"
        return "end"

    async def call_model(self, state: AgentState):
        messages = state['messages']
        # Add System Prompt if it's the first message
        if not any(isinstance(m, SystemMessage) for m in messages):
            messages = [SystemMessage(content=SYSTEM_PROMPT)] + list(messages)
        
        response = await self.llm_with_tools.ainvoke(messages)
        return {"messages": [response]}

    async def astream(self, message: str, history: list):
        # Format history
        formatted_messages = []
        for h in history:
            if h['role'] == 'user':
                formatted_messages.append(HumanMessage(content=h['text']))
            elif h['role'] == 'ai':
                formatted_messages.append(AIMessage(content=h['text']))
        
        formatted_messages.append(HumanMessage(content=message))
        
        # Stream the graph execution
        current_content = ""
        async for event in self.app.astream_events({"messages": formatted_messages}, version="v2"):
            kind = event["event"]
            node = event.get('metadata', {}).get('langgraph_node')
            
            # 1. Model is streaming tokens
            if kind == "on_chat_model_stream":
                content = event["data"]["chunk"].content
                if content:
                    current_content += content
                    yield content
            
            # 2. Tool is starting/ending
            elif kind == "on_tool_start":
                tool_name = event['name']
                friendly_name = tool_name.replace('_', ' ').title()
                yield f"\n\n*Assistant is accessing {friendly_name}...*\n\n"
            
            elif kind == "on_tool_end":
                output = event["data"].get("output")
                # Handle AUTO_ADD_TO_CART directive
                if isinstance(output, dict) and output.get("directive") == "AUTO_ADD_TO_CART":
                    yield f"|AUTO_ADD_CART|{json.dumps(output.get('product'))}|END_AUTO_ADD_CART|"
                
                # If the tool returned product data, send it as a special block
                elif isinstance(output, list) and len(output) > 0 and isinstance(output[0], dict) and "name" in output[0]:
                    # Limit to 3 products to avoid overwhelming the chat
                    for product in output[:3]:
                        yield f"|PRODUCT_JSON|{json.dumps(product)}|END_PRODUCT|"
                elif isinstance(output, dict) and "name" in output and "error" not in output:
                    yield f"|PRODUCT_JSON|{json.dumps(output)}|END_PRODUCT|"

            # 3. Fallback: Node finished but no incremental content was yielded
            elif kind == "on_chain_end" and node == "agent":
                output = event["data"].get("output")
                if output and "messages" in output:
                    last_msg = output["messages"][-1]
                    if isinstance(last_msg, AIMessage) and not last_msg.tool_calls:
                        content = last_msg.content
                        if content and not current_content:
                            if isinstance(content, str):
                                yield content
                            elif isinstance(content, list):
                                for part in content:
                                    if isinstance(part, str):
                                        yield part
                                    elif isinstance(part, dict) and "text" in part:
                                        yield part["text"]
                current_content = ""

