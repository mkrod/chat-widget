const protocol = "https";
const server_uri = "192.168.43.103:3000";
const cssPath = "https://helpful-madeleine-61e48d.netlify.app/index.css";    // path to the css file
const NotificationUrl = "./assets/notif-audio.mp3";
const ServerfileDir = `${protocol}://${server_uri}/chat_assets`; //replace with url of dir where the file are stored
const userDPurl = "https://cdn.vectorstock.com/i/750p/31/67/robot-icon-bot-sign-design-chatbot-symbol-vector-27973167.avif";
/*
const wScript = document.createElement("script");
wScript.src = "https://cdn.jsdelivr.net/npm/socket.io@4.0.1/dist/socket.io.min.js";
document.head.appendChild(wScript);

wScript.addEventListener("load", () => {
    const socket = io(`https://${server_uri}`)

socket.on('connect', function() {
    console.log('Connected to the server');
});

socket.on('message', function(data) {
    console.log('Message received: ', data);
});
})

*/
function getRandomString(length) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);

    return Array.from(array, (num) => chars[num % chars.length]).join('');
}


if(localStorage.getItem("alquify_ws_client_id") === null || !localStorage.getItem("alquify_ws_client_id")){
    const clientId = getRandomString(20);


    localStorage.setItem("alquify_ws_client_id", clientId);

}

const socket = new WebSocket(`wss://${server_uri}`);

// Event listener for when the connection is opened
socket.addEventListener('open', function (event) {
    console.log('Connected to WebSocket server');
    // Send a message to the server (optional)
    socket.send(JSON.stringify({type: 'register', userId: localStorage.getItem("alquify_ws_client_id"), message :'Hello Server!'}));
});

// Event listener for receiving messages
socket.addEventListener('message', function (event) {
    console.log('Message from server:', event.data);

    const info = JSON.parse(event.data);
    //console.log(info.data)
    if(info?.type === 'new-message'){
        getChat();

        if(localStorage.getItem("alquify_chat_notif") === "true" && info?.reciever === localStorage.getItem("alquify_ws_client_id")){
            console.log("sender: ", info);
            playNotification();
        }
       
    }
    

});

// Event listener for errors
socket.addEventListener('error', function (event) {
    console.error('WebSocket error:', event);
});

// Event listener for connection close
socket.addEventListener('close', function (event) {
    console.log('WebSocket connection closed:', event);
});


// load emooji library 
const emojiLink = "https://cdn.jsdelivr.net/npm/emoji-mart@latest/dist/browser.js";
const emojiScriptTag = document.createElement("script");
emojiScriptTag.src = emojiLink;
emojiScriptTag.async = true;
emojiScriptTag.defer = true;
document.body.appendChild(emojiScriptTag);



// load boxicons library
const boxicon = 'https://unpkg.com/boxicons@2.1.4/dist/boxicons.js';
const script = document.createElement('script');
script.src = boxicon;
document.head.appendChild(script);


// load css 

const css = document.createElement('link');
css.rel = 'stylesheet';
css.type = 'text/css';
css.href = cssPath;
document.head.appendChild(css);


/// load colors
/// load colors
let userID;

    // Check if script tag is used (outside WordPress)
    const customTag = document.getElementById("alquify-script-chat-widget");  // script tag in the html
if (customTag) {
    userID = customTag.getAttribute('data-user-id'); // Get ID from script tag
    console.log("Loaded via script tag, User ID:", userID);
}else if (typeof chatWidgetData !== "undefined") { // Check if running via WordPress (data comes from `wp_localize_script`)
    userID = chatWidgetData.userID; // Get ID from WordPress localization
    console.log("Loaded via WordPress, User ID:", userID);
}else {
    console.error("No widget ID found! Make sure you have set it up correctly.");
}

let theme;
let scheme;
let size = "cssSize";

// Retrieve or fetch user configuration
async function loadUserConfig() {
    const storedConfig = localStorage.getItem("alquify_chat_user_config");

    if (!storedConfig) {
        const customTag = document.getElementById("alquify-script-chat-widget");
        const userID = customTag?.getAttribute('data-user-id');

        if (!userID) {
            console.error("User ID is missing from the script tag.");
            return;
        }

        try {
            //const protocol = window.location.protocol;
            //const server_uri = "your-server.com"; // Replace with actual server
            const res = await fetch(`${protocol}://${server_uri}/get-user-config`, {
                method: "POST",
                body: JSON.stringify({ userID }),
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) throw new Error("Failed to fetch user config");

            const config = await res.json();
            localStorage.setItem("alquify_chat_user_config", JSON.stringify(config));

            applyConfig(config);
        } catch (error) {
            console.error("Error fetching user config:", error);
        }
    } else {
        applyConfig(JSON.parse(storedConfig));
    }
}

// Apply the retrieved configuration
function applyConfig(config) {
    theme = config.theme || "defaultTheme"; // Fallback value
    scheme = config.scheme || "defaultScheme";

    document.documentElement.style.setProperty('--alquify_chat_floating_button_ss2d1-tup5-5de0-00ef', theme);
    document.documentElement.style.setProperty('--alquify_chat_floating_button_fade_ss2d1-tup5-5de0-00ef', `${theme}7a`);

    console.log("Configs", theme, scheme, userID);
}

// Load configuration on script execution
loadUserConfig();


///

if(localStorage.getItem("alquify_chat_notif") === null) {

    localStorage.setItem("alquify_chat_notif", "true")

}




const createChatWidget = () => {

    const floatingChatWidget = document.createElement('div');
    floatingChatWidget.classList.add('alquify_chat_floating_button_ss2d1-tup5-5de0-00ef');
    const text = document.createElement('div');
    text.classList.add('alquify_floating_button_text');
    text.textContent = 'Chat';
    const iconContainer = document.createElement('div');
    iconContainer.classList.add('alquify_floating_chat_icon_container');
    iconContainer.innerHTML = `<box-icon name="comment" type="solid" color=${scheme} size=${size} class="alquify_chat_floating_button_icon_ss2d1-tup5-5de0-00ef"></box-icon>`;
    floatingChatWidget.setAttribute('onclick', 'openChatWidget()');
    text.style.color = scheme;

    floatingChatWidget.appendChild(iconContainer);
    floatingChatWidget.appendChild(text);
    document.body.appendChild(floatingChatWidget);



    // the chat widget appended to the body https://fortunestech.com.ng/wp-content/uploads/2024/12/C5FFB927-0DE0-4558-AFF1-C05D2F8A864C-e1733359546314.jpeg
    document.body.innerHTML += `
    <div class="alquify_chat_widget_container_ss2d1-tup5-5de0-00ef">
        <div class="alquify_chat_widget_header_ss2d1-tup5-5de0-00ef">
            <div class="alquify_chat_widget_header_left_ss2d1-tup5-5de0-00ef">
                <img src="https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/f3fa4135944368435b3d2242c3a46ca5~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=9fed221d&x-expires=1747447200&x-signature=RZXG7eun5gIXEGj%2Ff6Er85XOc7E%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva" id="alquify_chat_widget_user_dp_ss2d1-tup5-5de0-00ef" alt=""> <!-- Dp -->
            </div>

            <div class="alquify_chat_widget_header_center_ss2d1-tup5-5de0-00ef">
                <div class="alquify_chat_widget_header_center_up_ss2d1-tup5-5de0-00ef">How may we help?</div>
                <div class="alquify_chat_widget_header_center_down_ss2d1-tup5-5de0-00ef">
                    <div class="alquify_chat_widget_header_center_down_status_ss2d1-tup5-5de0-00ef"></div>
                    <div class="alquify_chat_widget_header_center_down_name_ss2d1-tup5-5de0-00ef">Average Response Time Frame</div>
                </div>
            </div>

            <div class="alquify_chat_widget_header_right_ss2d1-tup5-5de0-00ef">
                <box-icon name='dots-vertical-rounded' onclick="openOptions()"></box-icon>
                <box-icon name='chevron-down' onclick="closeChatWidget()"></box-icon>
            </div>
        </div>
        
          <div class="alquify_notification_bar">
            <box-icon type='solid' color="#fa5a2a" name='error-circle'></box-icon>
            <span class="alquify_notification_text">No Internet Connection</span>
          </div>

        <div class="alquify_chat_widget_main_ss2d1-tup5-5de0-00ef">

 

         <div class="chat_widget_main_activity_container">
           <img src="https://cdn.vectorstock.com/i/750p/31/67/robot-icon-bot-sign-design-chatbot-symbol-vector-27973167.avif" id="chat_widget_main_activity_dp" />
           <span class="chat_widget_main_activity">MkRoD joined the chat</span>
         </div>



        </div>

        <div class="alquify_chat_widget_emoji_container_ss2d1-tup5-5de0-00ef"></div>

        <div class="alquify_chat_widget_options_container_ss2d1-tup5-5de0-00ef">
          <div class="alquify_chat_widget_options">
            <div class="alquify_chat_widget_options_header">
                <span class="alquify_chat_widget_options_header_text">Settings</span>
                <box-icon name='x' color="#838383" onclick="openOptions()" class="alquify_chat_widget_options_header_x"></box-icon>
            </div>

            <div class="alquify_chat_widget_options_body">
              <div class="alquify_chat_widget_option">
                <box-icon name='bell-ring' type='solid' size="sm" color=${theme} ></box-icon>
                <span class="alquify_chat_widget_option_label">Notification sound</span>
                <div class="alquify_chat_widget_option_switch_control_container">
                   <label class="alquify_switch">
                      <input type="checkbox" id="alquify_checkbox" onchange="setNotif()" ${localStorage.getItem("alquify_chat_notif") === "true" && "checked"}>
                      <span class="alquify_slider alquify_round"></span>
                    </label>
                </div>
              </div>


            </div>
          </div>
        </div>

        <div class="alquify_chat_widget_filePreview_container_ss2d1-tup5-5de0-00ef" onclick="previewUrl(this)"></div>
        <box-icon type='solid' name='x-circle' color="#838383" class="close_alquify_preview" onclick="closePreviewUrl(this)"></box-icon>

        <div class="alquify_chat_widget_footer_ss2d1-tup5-5de0-00ef">
            <form onsubmit="handleSubmit(event, this)" enctype="multipart/form-data" id="alquify_message_form" class="alquify_chat_widget_footer_input_controls_ss2d1-tup5-5de0-00ef">
                <div class="alquify_chat_widget_footer_input_emoji_ss2d1-tup5-5de0-00ef">
                    <div class="alquify_input_placeholder_text">Type a message</div>
                    <div contenteditable="true" name="alquify_chat_widget_input" class="alquify_chat_widget_footer_input"></div>
                    <box-icon name='smile' color="#9b9b9b" class="alquify_chat_widget_footer_smile_emoji" onclick="toggleEmoji()"></box-icon>
                </div>
                <div class="alquify_chat_widget_footer_input_file_send_ss2d1-tup5-5de0-00ef">
                    <box-icon class="box-icon-paperclip" name='paperclip' size="xs" color="#9b9b9b"></box-icon>
                    <input type="file" name="file" onchange="previewFile(event)" id="alquify_chat_file" accept="application/*, text/*, image/*" />
                      <button class="box-icon-send" type="submit">
                        <box-icon name='send' size="xs" color=${scheme}></box-icon>
                      </button>
                </div>
            </form>
            <a class="alquify_chat_widget_footer_powered_text_ss2d1-tup5-5de0-00ef" href="">Powered by Alquify</a>
        </div>
    </div>
    `;

    const inputBox = document.querySelector('.alquify_chat_widget_footer_input');

    const pickerOptions = { 
        onEmojiSelect: (e) =>  inputBox.innerHTML += e.native,
    };

    const picker = new EmojiMart.Picker(pickerOptions);
    const emojiContainer = document.querySelector('.alquify_chat_widget_emoji_container_ss2d1-tup5-5de0-00ef');
    emojiContainer.appendChild(picker);



      /// send button 
    const messageBox = document.querySelector(".alquify_chat_widget_footer_input");
    messageBox.addEventListener("input", () => {
        //console.log(messageBox.textContent)

        if(messageBox.textContent !== "" || document.querySelector("#alquify_chat_file").files && document.querySelector("#alquify_chat_file").files.length > 0){
            document.querySelector(".box-icon-paperclip").style.scale = 0;
            document.querySelector(".box-icon-send").style.scale = 1;
        }else{
            document.querySelector(".box-icon-paperclip").style.scale = 1;
            document.querySelector(".box-icon-send").style.scale = 0;
        }

        if(messageBox.textContent !== ""){
            document.querySelector(".alquify_input_placeholder_text").style.opacity = 0;
        }else{
            document.querySelector(".alquify_input_placeholder_text").style.opacity = 1;
        }
    })

}

function toggleEmoji(){

    const emojiContainer = document.querySelector('.alquify_chat_widget_emoji_container_ss2d1-tup5-5de0-00ef');

    if (emojiContainer.style.opacity == 0 || emojiContainer.style.opacity == '') {
        emojiContainer.style.scale = 1;
        setTimeout(() => {
            emojiContainer.style.opacity = 1;
        }, 50)

    } else {
        emojiContainer.style.opacity = 0;

        setTimeout(() => {
            emojiContainer.style.scale = 0;
        }, 200)
    }

}


function setNotif() {
    localStorage.setItem("alquify_chat_notif", localStorage.getItem("alquify_chat_notif") === "true" ? "false" : "true")
}

function openOptions () {
    const optionContainer = document.querySelector(".alquify_chat_widget_options_container_ss2d1-tup5-5de0-00ef");

    
    if(optionContainer.style.display === "flex") {

        document.querySelector(".alquify_chat_widget_options").style.height = "0";
        setTimeout(() => {
            optionContainer.style.display = "none";
        }, 400)

    } else {

        optionContainer.style.display = "flex";
        setTimeout(() => {
            document.querySelector(".alquify_chat_widget_options").style.height = "300px";
        }, 100)
        

    }
}

function openChatWidget() {
    const chatWidget = document.querySelector('.alquify_chat_widget_container_ss2d1-tup5-5de0-00ef');
    chatWidget.style.scale = 1;
    setTimeout(() => {
        chatWidget.style.opacity = 1;
    }, 100)
    
    getChat() // fetch the chats on chat open
}
function closeChatWidget() {
    const chatWidget = document.querySelector('.alquify_chat_widget_container_ss2d1-tup5-5de0-00ef');
    chatWidget.style.opacity = 0;
    setTimeout(() => {
        chatWidget.style.scale = 0;
    }, 400)
}

function previewFile(event) {
    const file = event.target.files[0]; // Get the selected file
    const previewContainer = document.querySelector(".alquify_chat_widget_filePreview_container_ss2d1-tup5-5de0-00ef");
    const closePreviewContainer = document.querySelector(".close_alquify_preview");

    if (file) {
      const reader = new FileReader();

      // Use FileReader to load the file as a Blob
      reader.onload = function () {
        const blob = new Blob([reader.result], { type: file.type }); // Create Blob
        const blobURL = URL.createObjectURL(blob); // Generate Blob URL


        const fileName = file.name; // Get the file name
        const fileExtension = fileName.split('.').pop(); // Extract the extension
        console.log("File Extension:", fileExtension);

        previewContainer.textContent = fileExtension;
        previewContainer.style.display = "flex";
        closePreviewContainer.style.display = "flex";

        document.querySelector(".box-icon-paperclip").style.scale = 0;
        document.querySelector(".box-icon-send").style.scale = 1;

        previewContainer.setAttribute("data-url", blobURL);

       // window.open(blobURL, "_blank"); // Open in a new tab
      };

      reader.readAsArrayBuffer(file); // Read the file as an ArrayBuffer
    }
  }


  function previewUrl(element) {
    const fileUrl = element.getAttribute("data-url");
    //console.log(fileUrl)
    window.open(fileUrl, "_blank")
  }

  function closePreviewUrl(element){
    document.querySelector(".alquify_chat_widget_filePreview_container_ss2d1-tup5-5de0-00ef").style.display = "none";
    element.style.display = "none";
    document.querySelector(".box-icon-paperclip").style.scale = 1;
    document.querySelector(".box-icon-send").style.scale = 0;
    document.querySelector("#alquify_message_form").reset();
  }

  function openFile(element) {
    const fileUrl = element.getAttribute("data-url");
    //console.log(fileUrl)
    window.open(fileUrl, "_blank")
  }



///  logics for sending message ft websocket use socket variable. 
/// create a function to update ui when socket recieve new message
/// leggo below or inside the appropriate function


async function handleSubmit(event, form) { 
    event.preventDefault(); // Prevent the default form submission
    
    const now = new Date();
    const day = now.getDate().toString().padStart(2, "0");
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const year = now.getFullYear().toString();
    const hour = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    
    const date = `${day}/${month}/${year}`;
    const time = `${hour}:${minutes}`;

    const formData = new FormData(form);
    const file = formData.get("file");
    const messageBox = form.querySelector(".alquify_chat_widget_footer_input");
    const message = messageBox.textContent;
    formData.append("message", message);
    formData.append("date", date);
    formData.append("time", time);
    formData.append("sender", localStorage.getItem("alquify_ws_client_id"));
    formData.append("reciever", userID);
    //const type = 'send-message';

    sendMessage(formData);
    resetForm(form, messageBox);
}

// Helper function to reset the form and UI
function resetForm(form, messageBox){
    form.reset();
    document.querySelector(".alquify_chat_widget_filePreview_container_ss2d1-tup5-5de0-00ef").style.display = "none";
    document.querySelector(".close_alquify_preview").style.display = "none";
    document.querySelector(".box-icon-paperclip").style.scale = 1;
    document.querySelector(".box-icon-send").style.scale = 0;
    document.querySelector(".alquify_input_placeholder_text").style.opacity = 1;
    messageBox.textContent = "";
}


async function sendMessage(data) {
    const response = await fetch(`${protocol}://${server_uri}/send-message`, {
        method: "POST",
        body: data,
    })
}

function playNotification() {   
    const audio = document.createElement("audio");
    audio.src = NotificationUrl;
    audio.autoplay = true; // Ensures playback starts as soon as it's appended

    // Remove the audio element after playing to keep the DOM clean
    audio.onended = () => {
        audio.remove();
    };

    document.body.appendChild(audio);
}


// get the chats from server and pass itto another function to update the chat UI
async function getChat () {
    const data = {
        msg_client: localStorage.getItem("alquify_ws_client_id"),
        reciever: userID,
    }
     const response = await fetch(`${protocol}://${server_uri}/get-messages`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-type":"application/json",
        },
     });

     const res = await response.json();

     updateChat(res);
     
}

//get the message array and put the it on the message interface
async function updateChat(arrayOfMsg) {
    let output = "";

    if(document.querySelector(".alquify_chat_widget_main_ss2d1-tup5-5de0-00ef")){
        //message container
        const messageContainer = document.querySelector(".alquify_chat_widget_main_ss2d1-tup5-5de0-00ef");
        //console.log("recieved message array", arrayOfMsg)

        if(arrayOfMsg.length > 0){
            arrayOfMsg.forEach((msg) => {

                if(msg?.outgoing_id === localStorage?.getItem("alquify_ws_client_id") && msg?.outgoing_msg != "" && msg.file != ""){
                    // client sent a message and file
                    output +=  `
                        <div class="chat_widget_main_message_container">
                            <div class="chat_widget_main_message_right">
                                <div class="chat_widget_main_response_right_file_container" style="color: ${scheme};">
                                    <span class="chat_widget_main_response_right_filename">${msg.file.length > 20 ? msg.file.slice(0, 20) + "..." : msg.file}</span>
                                    <span class="chat_widget_main_message_right_file_extension" data-url="${ServerfileDir}/${msg.file}" style="background-color: ${scheme};" onclick="openFile(this)">${msg?.file?.split(".").pop().toLowerCase()}</span>
                                </div>
                                <span class="chat_widget_main_response_right_message" style="color: ${scheme};">${msg.outgoing_msg}</span>
                                <span class="chat_widget_main_response_right_time" style="color: ${scheme};">${msg.msg_timestamp}</span>
                            </div>

                            <div class="chat_widget_main_date_time">${msg.msg_date}</div>
                        </div>
                    `

                 }else if(msg?.outgoing_id === localStorage?.getItem("alquify_ws_client_id") && msg?.outgoing_msg != ""){
                    // the client sent a message only
                    output += `
                            <div class="chat_widget_main_message_container">
                                <div class="chat_widget_main_message_right">
                                    <span class="chat_widget_main_response_right_message" style="color: ${scheme};">${msg.outgoing_msg}</span>
                                    <span class="chat_widget_main_response_right_time" style="color: ${scheme};">${msg.msg_timestamp}</span>
                                </div>

                                <div class="chat_widget_main_date_time">${msg.msg_date}</div>
                            </div>
                    `

                }else if(msg?.outgoing_id === localStorage?.getItem("alquify_ws_client_id") && msg?.file != ""){
                    // client sent a file only
                    output += `
                        <div class="chat_widget_main_message_container">
                            <div class="chat_widget_main_message_right">
                                <div class="chat_widget_main_response_right_file_container" style="color: ${scheme};">
                                <span class="chat_widget_main_response_right_filename">${msg.file.length > 20 ? msg.file.slice(0, 20) + "..." : msg.file}</span>
                                <span class="chat_widget_main_message_right_file_extension" data-url="${ServerfileDir}/${msg.file}" style="background-color: ${scheme};" onclick="openFile(this)">${msg?.file?.split(".").pop().toLowerCase()}</span>
                                </div>
                                <span class="chat_widget_main_response_right_time" style="color: ${scheme};">${msg.msg_timestamp}</span>
                            </div>

                            <div class="chat_widget_main_date_time">${msg.msg_date}</div>
                        </div>
                    `

                }else if(msg?.outgoing_id === userID && msg?.outgoing_msg != "" && msg.file != ""){
                    // the alquify user sent the message and a file
                    output += `
                        <div class="chat_widget_main_response_container">
                            <div class="chat_widget_main_response_left">
                                <img src="${userDPurl}" id="chat_widget_response_dp" />
                            </div>
                            <div class="chat_widget_main_response_right">
                            <span class="chat_widget_main_response_right_message">${msg.outgoing_msg}</span>
                                <div class="chat_widget_main_response_right_file_container">
                                    <span class="chat_widget_main_response_right_filename">${msg.file.length > 20 ? msg.file.slice(0, 20) + "..." : msg.file}</span>
                                    <span class="chat_widget_main_response_right_file_extension" data-url="${ServerfileDir}/${msg.file}" style="color: ${scheme};" onclick="openFile(this)">${msg?.file?.split(".").pop().toLowerCase()}</span>
                                </div>

                                <span class="chat_widget_main_response_right_time">${msg.msg_timestamp}</span>
                            </div>
                            
                            <div class="chat_widget_main_date_time">${msg.msg_date}</div>
                        </div>
                    `


                }else if(msg?.outgoing_id === userID && msg?.outgoing_msg != ""){
                    // the alquify user sent message only
                    output += `
                        <div class="chat_widget_main_response_container">
                            <div class="chat_widget_main_response_left">
                                <img src="${userDPurl}" id="chat_widget_response_dp" />
                            </div>
                            <div class="chat_widget_main_response_right">
                                <span class="chat_widget_main_response_right_message">${msg.outgoing_msg}</span>
                                <span class="chat_widget_main_response_right_time">${msg.msg_timestamp}</span>
                            </div>

                            <div class="chat_widget_main_date_time">${msg.msg_date}</div>
                        </div>
                    `

                } else if(msg?.outgoing_id === userID && msg?.file != "" ) {
                    // the alquify user sent file only
                    output += `
                        <div class="chat_widget_main_response_container">
                            <div class="chat_widget_main_response_left">
                                <img src="${userDPurl}" id="chat_widget_response_dp" />
                            </div>
                            <div class="chat_widget_main_response_right">
                                <div class="chat_widget_main_response_right_file_container">
                                <span class="chat_widget_main_response_right_filename">${msg.file.length > 20 ? msg.file.slice(0, 20) + "..." : msg.file}</span>
                                <span class="chat_widget_main_response_right_file_extension" data-url="${ServerfileDir}/${msg.file}" style="color: ${scheme};" onclick="openFile(this)">${msg?.file?.split(".").pop().toLowerCase()}</span>
                                </div>
                                <span class="chat_widget_main_response_right_time">${msg.msg_timestamp}</span>
                            </div>

                            <div class="chat_widget_main_date_time">${msg.msg_date}</div>
                        </div>
                    `

                }
            })

            messageContainer.innerHTML = output;
            scrollToBottom();

        }else{
            // handle ui for no messsage
            messageContainer.innerHTML = ``;
        }
    }
}

 
function scrollToBottom() {
    const chatContainer = document.querySelector('.alquify_chat_widget_main_ss2d1-tup5-5de0-00ef');
    chatContainer.scrollTop = chatContainer.scrollHeight;
}




// Event listener for when the document is loaded

    // Ensure EmojiMart is loaded before initializing the picker
        emojiScriptTag.onload = () => {
            console.log("EmojiMart loaded successfully!");
            createChatWidget();  // Now call the function that uses EmojiMart
        };

document.removeEventListener('DOMContentLoaded', null);
