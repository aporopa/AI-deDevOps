//Get reference to our elements
const submit = document.getElementById("submit");
const userInput = document.getElementById("user-input");
const chatHistory = document.getElementById("chat-history");
const loading = document.getElementById("spinner");
let isOutputPaused = false;
let promptResponses = [];

document.addEventListener('DOMContentLoaded', (event) => {
  document.getElementById('startButton').addEventListener('click', function() {
      document.getElementById('welcome-screen').style.display = 'none';
      document.querySelector('.main-content').classList.add('active');
      addMessageToChat('Hello! I\'m AI-de, your personal Artificial Intelligence aide! How can I assist you today?', false);
  });
});

// Function to add messages to chat with a typewriter effect
function addMessageToChat(text, isUser) {
  if (isOutputPaused && !isUser) {
    // If output is paused and the message is not from the user, do not add it to chat
    return;
  }
  const className = 'text-black'; // Use custom class for black text
  const historyElement = document.createElement('li');
  historyElement.classList.add('list-group-item');
  chatHistory.appendChild(historyElement);

  if (isUser) {
    // For user messages, display them immediately without typewriter effect
    historyElement.innerHTML = `<span class="${className}">${text}</span>`;
  } else {
    // Modify the text to insert a line break before each number in the list
    text = text.replace(/(\d+\.) /g, '<br>$1 ');

    // Remove the first <br> if it is at the start of the response
    text = text.replace(/^<br>/, '');

    // For system responses, apply the typewriter effect
    historyElement.classList.add('type-writer');
    typeWriter(text, 0, historyElement, function() {
      historyElement.classList.remove('type-writer');
    });
  }
}

function typeWriter(text, i, elem, fnCallback) {
  // Store the complete text in the dataset attribute
  if (i === 0) {
    elem.dataset.completeText = text;
  }

  if (i < (text.length)) {
    elem.innerHTML = text.substring(0, i + 1) + '<span aria-hidden="true"></span>';

    // Check if output is paused
    if (isOutputPaused) {
      // Store current state for resuming
      elem.dataset.typingIndex = i;
      return; // Exit if output is paused
    }

    setTimeout(function() {
      typeWriter(text, i + 1, elem, fnCallback)
    }, 25); 
  } else if (typeof fnCallback == 'function') {
    setTimeout(fnCallback, 1000);
  }
}

// Function to resume typing
function resumeTyping() {
  document.querySelectorAll('.type-writer').forEach(elem => {
    const text = elem.dataset.completeText;
    const storedIndex = parseInt(elem.dataset.typingIndex, 10);

    if (text !== undefined && !isNaN(storedIndex)) {
      // Continue the typewriter effect from the stored index
      typeWriter(text, storedIndex, elem, function() {
        elem.classList.remove('type-writer');
        delete elem.dataset.typingIndex; // Clean up dataset attribute
      });
    }
  });
}

// Function to handle the API response
const generateResponse = async () => {
    loading.classList.remove("visually-hidden");
    submit.classList.add("visually-hidden");
    const input = userInput.value;

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            body: JSON.stringify({
              model: "ft:gpt-3.5-turbo-0613:personal::8Q6uS55i", // 29 November 2023 @ 11:45pm version
              messages: [{"role": "user", "content": input}],
                temp: 0.6
            }), 
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const responseData = await response.json();
        const message = responseData.result[0].message.content;
        console.log(message);

        promptResponses.push({question: input, response: message});

        userInput.value = "";
        addMessageToChat(`You: ${input}`, true);
        addMessageToChat(`AI-de: ${message}`, false);

    } catch (error) {
        console.error('Error during API call', error);
        addMessageToChat('Sorry, there was an error communicating with the server.', false);
    } finally {
        // Stop loading spinner
        loading.classList.add("visually-hidden");
        submit.classList.remove("visually-hidden");
    }
};

document.getElementById('pauseButton').addEventListener('click', function() {
  isOutputPaused = !isOutputPaused; // Toggle the paused state
  this.textContent = isOutputPaused ? 'Resume' : 'Pause'; // Update the button text

  // Resume typing if output is not paused
  if (!isOutputPaused) {
    resumeTyping();
  }
});


// Assign onclick method
submit.onclick = generateResponse;