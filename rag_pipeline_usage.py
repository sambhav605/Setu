from module_a.rag_chain import LegalRAGChain

# Initialize chain
rag = LegalRAGChain()

# Run query
user_query = input("Enter your legal question: ")
result = rag.run(user_query)

# Access results
print(result['explanation'])
print(result['sources'])

