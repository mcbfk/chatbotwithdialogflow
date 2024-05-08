
import random
import json
import os
from google.cloud import dialogflow

import torch
import logging

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "mcbfk-hjvt-a1c86a6b0163.json"

DIALOGFLOW_PROJECT_ID = 'mcbfk-hjvt'
DIALOGFLOW_LANGUAGE_CODE = 'pt-BR'  # Altere para o código de idioma adequado
SESSION_ID = 'mcbfk'

client = dialogflow.SessionsClient()
session = client.session_path(DIALOGFLOW_PROJECT_ID, SESSION_ID)

logging.basicConfig(level=logging.INFO)

from model import NeuralNet
from nltk_utils import bag_of_words, tokenize

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

with open('intents.json', 'r', encoding='utf-8') as json_data:
    intents = json.load(json_data)

FILE = "data.pth"
data = torch.load(FILE)

input_size = data["input_size"]
hidden_size = data["hidden_size"]
output_size = data["output_size"]
all_words = data['all_words']
tags = data['tags']
model_state = data["model_state"]

model = NeuralNet(input_size, hidden_size, output_size).to(device)
model.load_state_dict(model_state)
model.eval()

bot_name = "mcbfk"

def get_response(msg):
    text_input = dialogflow.TextInput(text=msg, language_code=DIALOGFLOW_LANGUAGE_CODE)
    query_input = dialogflow.QueryInput(text=text_input)

    response = client.detect_intent(request={"session": session, "query_input": query_input})

    if response.query_result.intent.is_fallback:
        fallback_response = "Eu não entendi..."
    else:
        fallback_response = response.query_result.fulfillment_text

    # Processamento adicional
    sentence = tokenize(msg)
    X = bag_of_words(sentence, all_words)
    X = X.reshape(1, X.shape[0])
    X = torch.from_numpy(X).to(device)

    output = model(X)
    _, predicted = torch.max(output, dim=1)

    tag = tags[predicted.item()]

    probs = torch.softmax(output, dim=1)
    prob = probs[0][predicted.item()]
    if prob.item() > 0.75:
        neural_response = []
        for intent in intents['intents']:
            if tag == intent["tag"]:
                neural_response.append(random.choice(intent['responses']))

        # Adiciona a resposta do Dialogflow como uma opção de resposta
        if fallback_response not in neural_response:
            neural_response.append(fallback_response)

        logging.info(f"Neural Response: {neural_response}")
        return random.choice(neural_response)

    return fallback_response
