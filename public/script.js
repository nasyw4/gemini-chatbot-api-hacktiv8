const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatbox = document.getElementById("chatbox");

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevent default form submission

  const userMessage = userInput.value.trim();
  if (!userMessage) {
    return; // Don't send empty messages
  }

  // Display user's message in the chatbox
  appendMessage(userMessage, "user-message");
  userInput.value = ""; // Clear the input field

  try {
    // Show a thinking indicator (optional)
    const thinkingIndicator = appendMessage("Bot is thinking...", "bot-message");

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: userMessage }),
    });

    // Remove thinking indicator
    if (thinkingIndicator) {
      chatbox.removeChild(thinkingIndicator);
    }

    if (!response.ok) {
      // Try to parse error message from backend if available
      let errorMessage = `Error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.reply) {
          errorMessage = `Error: ${errorData.reply}`;
        }
      } catch (e) {
        // If parsing error response fails, stick to the status text
      }
      appendMessage(errorMessage, "bot-message");
      console.error("Failed to send message:", response.status, response.statusText);
      return;
    }

    const data = await response.json();
    if (data && data.reply) {
      appendMessage(data.reply, "bot-message");
    } else {
      appendMessage("Received an empty or invalid response from the bot.", "bot-message");
    }
  } catch (error) {
    // Remove thinking indicator if it exists and an error occurs
    // A more robust way to find the thinking indicator might be needed if multiple bot messages can appear quickly
    const lastBotMessage = chatbox.querySelector(".bot-message:last-child");
    if (lastBotMessage && lastBotMessage.textContent.includes("Bot is thinking...")) {
      chatbox.removeChild(lastBotMessage);
    }
    appendMessage("An error occurred while connecting to the chatbot. Please check the console.", "bot-message");
    console.error("Error sending message:", error);
  }
});

function appendMessage(message, className) {
  const messageElement = document.createElement("div");
  messageElement.classList.add(className);
  messageElement.textContent = message;
  chatbox.appendChild(messageElement);
  chatbox.scrollTop = chatbox.scrollHeight; // Scroll to the bottom
  return messageElement; // Return the element if needed (e.g., for removing thinking indicator)
}
