"""
Memory management for agents (Step 6: Add Memory and Long-term Context)
Supports conversational memory, summary memory, and vector-based memory
"""
from typing import Any, Dict, List, Optional
from langchain.memory import ConversationBufferMemory, ConversationSummaryMemory
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langchain_community.vectorstores import Chroma, FAISS
from langchain_core.embeddings import Embeddings
from langchain_openai import OpenAIEmbeddings


class MemoryManager:
    """
    Manages different types of memory for agents
    
    Memory Types:
    - Conversational: Stores recent conversation history
    - Summary: Summarizes conversation history to save tokens
    - Vector: Stores embeddings for semantic search of past interactions
    """
    
    def __init__(
        self,
        memory_type: str = "conversational",
        llm: Optional[Any] = None,
        embeddings: Optional[Embeddings] = None,
        max_token_limit: int = 2000
    ):
        """
        Initialize memory manager
        
        Args:
            memory_type: Type of memory ("conversational", "summary", "vector")
            llm: Language model for summary memory
            embeddings: Embeddings model for vector memory
            max_token_limit: Maximum tokens to store in memory
        """
        self.memory_type = memory_type
        self.llm = llm
        self.embeddings = embeddings or OpenAIEmbeddings()
        self.max_token_limit = max_token_limit
        
        self._initialize_memory()
    
    def _initialize_memory(self):
        """Initialize the appropriate memory type"""
        if self.memory_type == "conversational":
            self.memory = ConversationBufferMemory(
                return_messages=True,
                memory_key="chat_history"
            )
        
        elif self.memory_type == "summary":
            if self.llm is None:
                raise ValueError("LLM required for summary memory")
            
            self.memory = ConversationSummaryMemory(
                llm=self.llm,
                return_messages=True,
                memory_key="chat_history"
            )
        
        elif self.memory_type == "vector":
            # Initialize vector store for semantic memory
            self.vector_store = FAISS.from_texts(
                ["Initial memory"],
                self.embeddings
            )
            self.memory = None  # Custom handling for vector memory
        
        else:
            raise ValueError(f"Unknown memory type: {self.memory_type}")
    
    def add_message(self, human_message: str, ai_message: str):
        """
        Add a conversation turn to memory
        
        Args:
            human_message: User's message
            ai_message: AI's response
        """
        if self.memory_type == "vector":
            # Store in vector database with metadata
            text = f"Human: {human_message}\nAI: {ai_message}"
            self.vector_store.add_texts([text])
        
        else:
            # Use standard memory
            self.memory.save_context(
                {"input": human_message},
                {"output": ai_message}
            )
    
    def get_memory(self) -> Any:
        """Get the memory object"""
        return self.memory
    
    def get_relevant_memory(self, query: str, k: int = 3) -> List[str]:
        """
        Retrieve relevant memory items (for vector memory)
        
        Args:
            query: Query to search for
            k: Number of results to return
        
        Returns:
            List of relevant memory items
        """
        if self.memory_type != "vector":
            raise ValueError("get_relevant_memory only works with vector memory")
        
        docs = self.vector_store.similarity_search(query, k=k)
        return [doc.page_content for doc in docs]
    
    def get_conversation_history(self) -> List[BaseMessage]:
        """
        Get conversation history as messages
        
        Returns:
            List of conversation messages
        """
        if self.memory_type == "vector":
            # For vector memory, we don't maintain sequential history
            return []
        
        return self.memory.chat_memory.messages
    
    def clear_memory(self):
        """Clear all memory"""
        if self.memory_type == "vector":
            self._initialize_memory()
        else:
            self.memory.clear()
    
    def save_memory(self, filepath: str):
        """
        Save memory to disk
        
        Args:
            filepath: Path to save memory
        """
        if self.memory_type == "vector":
            self.vector_store.save_local(filepath)
        else:
            # For conversational/summary memory, save messages
            import json
            
            messages = [
                {
                    "type": type(msg).__name__,
                    "content": msg.content
                }
                for msg in self.memory.chat_memory.messages
            ]
            
            with open(filepath, 'w') as f:
                json.dump(messages, f)
    
    def load_memory(self, filepath: str):
        """
        Load memory from disk
        
        Args:
            filepath: Path to load memory from
        """
        if self.memory_type == "vector":
            self.vector_store = FAISS.load_local(
                filepath,
                self.embeddings,
                allow_dangerous_deserialization=True
            )
        else:
            # Load conversational/summary memory
            import json
            
            with open(filepath, 'r') as f:
                messages = json.load(f)
            
            for msg in messages:
                if msg["type"] == "HumanMessage":
                    self.memory.chat_memory.add_message(
                        HumanMessage(content=msg["content"])
                    )
                elif msg["type"] == "AIMessage":
                    self.memory.chat_memory.add_message(
                        AIMessage(content=msg["content"])
                    )


class ConversationalMemory:
    """Simple conversational memory for tracking recent interactions"""
    
    def __init__(self, max_messages: int = 10):
        self.messages: List[BaseMessage] = []
        self.max_messages = max_messages
    
    def add_user_message(self, content: str):
        """Add a user message"""
        self.messages.append(HumanMessage(content=content))
        self._trim_messages()
    
    def add_ai_message(self, content: str):
        """Add an AI message"""
        self.messages.append(AIMessage(content=content))
        self._trim_messages()
    
    def get_messages(self) -> List[BaseMessage]:
        """Get all messages"""
        return self.messages
    
    def _trim_messages(self):
        """Keep only the most recent messages"""
        if len(self.messages) > self.max_messages:
            self.messages = self.messages[-self.max_messages:]
    
    def clear(self):
        """Clear all messages"""
        self.messages = []


class SummaryMemory:
    """Memory that maintains a running summary of the conversation"""
    
    def __init__(self, llm: Any):
        self.llm = llm
        self.summary = ""
        self.recent_messages: List[BaseMessage] = []
    
    def add_interaction(self, human_message: str, ai_message: str):
        """Add an interaction and update summary"""
        self.recent_messages.append(HumanMessage(content=human_message))
        self.recent_messages.append(AIMessage(content=ai_message))
        
        # Update summary every 5 interactions
        if len(self.recent_messages) >= 10:
            self._update_summary()
    
    def _update_summary(self):
        """Update the conversation summary"""
        conversation_text = "\n".join([
            f"{'Human' if isinstance(msg, HumanMessage) else 'AI'}: {msg.content}"
            for msg in self.recent_messages
        ])
        
        prompt = f"""
        Current summary:
        {self.summary}
        
        New conversation:
        {conversation_text}
        
        Please provide an updated summary that incorporates the new information.
        """
        
        response = self.llm.invoke(prompt)
        self.summary = response.content if hasattr(response, 'content') else str(response)
        
        # Clear recent messages after summarizing
        self.recent_messages = []
    
    def get_summary(self) -> str:
        """Get the current summary"""
        return self.summary
    
    def get_context(self) -> str:
        """Get full context (summary + recent messages)"""
        context = f"Summary of previous conversation:\n{self.summary}\n\n"
        
        if self.recent_messages:
            context += "Recent messages:\n"
            context += "\n".join([
                f"{'Human' if isinstance(msg, HumanMessage) else 'AI'}: {msg.content}"
                for msg in self.recent_messages
            ])
        
        return context

