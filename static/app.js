class Chatbox {
    constructor(){
        this.args= {
            openButton: document.querySelector(".chatbox__button"),
            chatBox: document.querySelector(".chatbox__support"),
            sendButton: document.querySelector(".send__button"),
        }

        this.state = false;
        this.messages = [];
    }

    display() {
        const {openButton, chatBox, sendButton } = this.args;
    
        openButton.addEventListener("click", () => {
            this.toggleState(chatBox);
            this.toggleButton(openButton);
        });
    
        sendButton.addEventListener("click", () => this.onSendButton(chatBox));
    
        const node = chatBox.querySelector("input");
        node.addEventListener("keyup", ({key}) => {
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
        if(this.state) {
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
            let msg2 = { name: "Sam", message: r.answer};
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
        this.messages.slice().reverse().forEach(function(item){
            if (item.name === "Sam"){
                html += "<div class='messages__item messages__item--visitor'>" + UTF8.decode(item.message) + "</div>"
            } else {
                html += "<div class='messages__item messages__item--operator'>" + item.message + "</div>"
            }
        }); 
    
        const chatmessage = chatbox.querySelector(".chatbox__messages");
        chatmessage.innerHTML = html;
    }

    // Função para adicionar botões de serviço
    addServiceButtons(chatbox) {
        var services = ["Desenvolvimento de sites", "Design", "Freelancer"];

        // Crie uma nova div para os botões de serviço
        var buttonBox = document.createElement("div");
        buttonBox.classList.add("chatbox__buttonBox");

        services.forEach(service => {
            var button = document.createElement("button");
            button.innerHTML = service;
            button.onclick = () => { 
                this.onServiceButton(chatbox, service); 

                // Adicione a classe fade-out ao chatbox__buttonBox
                buttonBox.classList.add("fade-out");

                setTimeout(() => {
                    // Remova o chatbox__buttonBox depois que a animação terminar
                    buttonBox.remove();

                    // Encontre o elemento chatbox__messages
                    var messages = chatbox.querySelector(".chatbox__messages");

                    // Adicione padding-bottom ao chatbox__messages
                    messages.style.paddingBottom = "20px";
                }, 1000); // Espere 1 segundo para a transição de desaparecimento terminar
            };

            // Adicione o botão dentro da div buttonBox
            buttonBox.appendChild(button);
        });

        // Encontre o elemento chatbox__footer
        var footer = chatbox.querySelector(".chatbox__footer");

        // Insira a div buttonBox antes do chatbox__footer
        chatbox.insertBefore(buttonBox, footer);
    }

    // Função para lidar com o clique no botão de serviço
    onServiceButton(chatbox, service) {
        var textField = chatbox.querySelector("input");
        textField.value = service;
        this.onSendButton(chatbox);
    }
}

var TextDecoder = require('@mattiasbuelens/js-encoding').TextDecoder;

UTF8 = {
    decode: function(s) {
        try {
            var decoder = new TextDecoder('utf-8');
            var bytes = new Uint8Array(s.length);
            for (var i = 0; i < s.length; i++) {
                bytes[i] = s.charCodeAt(i);
            }
            return decoder.decode(bytes);
        } catch(e) {
            return s;
        }
    }
};


const chatbox = new Chatbox();
chatbox.display();  
