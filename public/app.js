class Chatbox {
    constructor() {
        this.args = {
            openButton: document.querySelector(".chatbox__button"),
            chatBox: document.querySelector(".chatbox__support"),
            sendButton: document.querySelector(".send__button"),
        }

        this.state = false;
        this.messages = [];
    }

    display() {
        const { openButton, chatBox, sendButton } = this.args;

        openButton.addEventListener("click", () => {
            this.toggleState(chatBox);
            this.toggleButton(openButton);
        });

        sendButton.addEventListener("click", () => this.onSendButton(chatBox));

        const node = chatBox.querySelector("input");
        node.addEventListener("keyup", ({ key }) => {
            if (key === "Enter") {
                this.onSendButton(chatBox);
            }
        });

        const closeButton = chatBox.querySelector(".chatbox__heading--closebtn");
        closeButton.addEventListener("click", () => {
            this.toggleState(chatBox);
            this.toggleButton(openButton);
        });

        // Adicione os botões de serviço ao chatbox
        this.addServiceButtons(chatBox);
    }


    toggleState(chatbox) {
        this.state = !this.state;

        //show or hide the box
        if (this.state) {
            chatbox.classList.add("chatbox--active")
        } else {
            chatbox.classList.remove("chatbox--active")
        }
    }

    toggleButton(button) {
        if (this.state) {
            button.style.display = "none";
        } else {
            button.style.display = "block";
        }
    }

    onSendButton(chatbox) {
        var textField = chatbox.querySelector("input");
        let text1 = textField.value
        if (text1 === "") {
            return;
        }

        let msg1 = { name: "User", message: text1 }
        this.messages.push(msg1);

        // 'http://127.0.0.1:5000/predict
        fetch($SCRIPT_ROOT + "/predict", {
            method: "POST",
            body: JSON.stringify({ message: text1 }),
            mode: "cors",
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(r => r.json())
            .then(r => {
                let msg2 = { name: "mcbfk", message: r.answer };
                this.messages.push(msg2);
                this.updateChatText(chatbox)
                textField.value = ""
            }).catch((error) => {
                console.error("Error:", error);
                this.updateChatText(chatbox)
                textField.value = ""
            })
    }

    updateChatText(chatbox) {
        var html = "";
        this.messages.slice().reverse().forEach(function (item) {
            var message = item.message;
            var decodedMessage = UTF8.decode(message);
    
            if (item.name === "mcbfk") {
                html += "<div class='messages__item messages__item--visitor'>" + decodedMessage + "</div>"
            } else if (item.name === "User") {
                html += "<div class='messages__item messages__item--operator'>" + decodedMessage + "</div>"
            } else {
                // Adicione a mensagem do Dialogflow à interface
                html += "<div class='messages__item messages__item--visitor'>" + decodedMessage + "</div>"
            }
        });
    
        const chatmessage = chatbox.querySelector(".chatbox__messages");
        chatmessage.innerHTML = html;
    }
    
    
    


    addServiceButtons(chatbox) {
        var services = ["Desenvolvimento de sites", "Design", "Freelancer"];

        var buttonBox = document.createElement("div");
        buttonBox.classList.add("chatbox__buttonBox");

        services.forEach(service => {
            var button = document.createElement("button");
            button.innerHTML = service;
            button.onclick = () => {
                var textField = chatbox.querySelector("input");
                textField.value = service;
                this.onSendButton(chatbox);

                buttonBox.remove();

                var messages = chatbox.querySelector(".chatbox__messages");
                messages.style.paddingBottom = "20px";

                var simNaoBox = document.createElement("div");
                simNaoBox.classList.add("chatbox__buttonBox");

                var buttonSim = document.createElement("button");
                buttonSim.innerHTML = "Sim";
                buttonSim.onclick = () => {
                    var messageOperator = document.createElement("div");
                    messageOperator.classList.add("messages__item", "messages__item--operator");
                    messageOperator.innerHTML = "Sim";
                    messages.insertBefore(messageOperator, messages.firstChild);

                    var messageVisitor = document.createElement("div");
                    messageVisitor.classList.add("messages__item", "messages__item--visitor");
                    // Alteração: Adicionando link com texto formatado e sublinhado
                    messageVisitor.innerHTML = `Por favor, entre em contato conosco pelo <a href="https://api.whatsapp.com/send?phone=5511913739736" style="text-decoration: underline;">WhatsApp</a>.`;
                    messages.insertBefore(messageVisitor, messageOperator);

                    simNaoBox.remove();
                    messages.style.paddingBottom = "0"; // Definindo padding-bottom como 0
                };
                simNaoBox.appendChild(buttonSim);

                var buttonNao = document.createElement("button");
                buttonNao.innerHTML = "Não";
                buttonNao.onclick = () => {
                    simNaoBox.remove();
                    this.addServiceButtons(chatbox);
                };
                simNaoBox.appendChild(buttonNao);

                var footer = chatbox.querySelector(".chatbox__footer");
                footer.insertAdjacentElement("beforebegin", simNaoBox);
            };

            buttonBox.appendChild(button);
        });

        var footer = chatbox.querySelector(".chatbox__footer");
        chatbox.insertBefore(buttonBox, footer);
    }



    onServiceButton(chatbox, service) {
        var textField = chatbox.querySelector("input");
        textField.value = service;
        this.onSendButton(chatbox);
    }
}



var UTF8 = {
    decode: function (s) {
        var decoder = new TextDecoder('utf-8');
        var encoded = new TextEncoder().encode(s);
        var decoded = decoder.decode(encoded);
        return decoded;
    }
};

const chatbox = new Chatbox();
chatbox.display();  
