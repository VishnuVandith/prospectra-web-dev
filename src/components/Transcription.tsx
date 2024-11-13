import React, { useState, useEffect, useRef } from "react";
import { Ollama } from "ollama";

// Check if browser supports the Web Speech API
const SpeechRecognition =
  typeof window.SpeechRecognition !== "undefined"
    ? window.SpeechRecognition
    : typeof (window as any).webkitSpeechRecognition !== "undefined"
    ? (window as any).webkitSpeechRecognition
    : null;

if (!SpeechRecognition) {
  alert("Your browser does not support Speech Recognition");
}

// Define intents for user inputs
const intents = [
  {
    name: "greeting",
    keywords: ["hello", "hi", "hey"],
    response: "Hello! How can I help you today?",
  },
  {
    name: "product_info",
    keywords: ["product", "information", "details", "tell me about"],
    response:
      "Transloom is an intelligent translation service specializing in multilingual SEO optimization. It can handle text, images, audio, video, and websites. For more details, you can contact us at info@transloom.com or call +917207776177.",
  },
  {
    name: "contact_info",
    keywords: ["contact", "email", "phone", "reach out"],
    response:
      "You can contact Transloom's sales team at info@transloom.com or call +917207776177.",
  },
  {
    name: "services",
    keywords: ["services", "offer", "what can you do"],
    response:
      "Transloom offers translation services for SEO keywords, text, images, audio, video, and websites using advanced AI models. We focus on quality, cultural nuances, and SEO optimization.",
  },
  {
    name: "farewell",
    keywords: ["bye", "goodbye", "see you"],
    response: "Goodbye! Feel free to reach out anytime you need assistance.",
  },
];

const Transcription: React.FC = () => {
  const [transcript, setTranscript] = useState<string>("");
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);

  const context = `
    your name is Vikhyath a salesman who is empathetic, confident, knowledgeable, resilient, adaptable, and goal-driven, focused on building trust and long-term customer relationships while delivering tailored solutions. I want you to sell the product of Transloom below is the description of the product.
Transloom is a cutting-edge intelligent translation service transforming how businesses expand globally by making content accessible across languages and regions. The company specializes in translating SEO keywords, ensuring optimized multilingual visibility for websites and digital assets. With custom-built M2M (many-to-many) models, Transloom can handle translations for not only text but also images, audio, video, and entire websites, ensuring comprehensive, seamless support for global audiences.
    One of the key advantages of Transloom is its focus on quality and relevance in translation. Instead of simply converting words, Transloom’s AI-powered approach captures context, nuances, and cultural specifics to create content that resonates authentically with local audiences. This is especially valuable for businesses aiming to maintain their brand identity while expanding into new markets.
    The service uses sophisticated AI algorithms and advanced NLP (natural language processing) models that support diverse language pairs and industry-specific terminologies. Through their technology, Transloom enables businesses to break language barriers efficiently without compromising on quality or performance. The platform’s M2M models are fine-tuned for large-scale, real-time translations, meeting the demands of dynamic, high-traffic content without delay.
    For SEO, Transloom has a specialized approach. Its models are designed to retain and optimize keywords within translated content, ensuring that websites remain discoverable in search engines across multiple languages. This is particularly beneficial for businesses aiming to attract international customers through organic search traffic. By leveraging AI-driven translations that prioritize SEO, Transloom clients are able to increase their reach and visibility effectively.
    Transloom is also built to adapt to evolving needs in digital content. The platform supports large file translations and bulk requests, allowing businesses to manage high-volume translation projects without manual intervention. With an intuitive user interface, businesses can easily upload, manage, and monitor translation projects, simplifying multilingual content management.
    The service also offers clients the option to integrate the Transloom API into their existing workflows. This flexibility empowers companies to automate translation processes and scale up quickly. By integrating directly with CMS platforms, e-commerce systems, or social media, clients can effortlessly localize their content with minimal setup.
    For industries with stringent security requirements, such as finance or healthcare, Transloom ensures that data is handled securely. The service employs encryption protocols and secure cloud environments to keep sensitive information safe throughout the translation process.
    Beyond just technology, Transloom is focused on building long-term relationships with clients. It offers support and consultation for those looking to tailor their translation strategies based on market insights, helping businesses not only translate content but strategically align it for success in each target market.
    Transloom’s forward-thinking approach to translation makes it an invaluable partner for any business aiming to bridge language divides and engage new audiences on a global scale.Transloom is a cutting-edge translation and AI company dedicated to revolutionizing the way businesses and individuals communicate across languages. Founded by a team of experts in artificial intelligence, natural language processing, software engineering, and linguistics, Transloom’s mission is to break down language barriers and facilitate seamless global communication. The company’s innovative solutions are designed to make translation accurate, context-aware, and culturally relevant, allowing clients to reach wider audiences and enhance their global presence.
    Vishnu Vandith Guntupalli is the Chief Technology Officer of Transloom
They can get in touch with transloom's sales team at info@transloom.com or call on +917207776177
  `;

  const ollamaResponse = async (transcript: string) => {
    const ollama = new Ollama({ host: "http://127.0.0.1:11434" });
    const response = await ollama.chat({
      model: "nemotron-mini",
      messages: [
        { role: "system", content: context },
        { role: "user", content: transcript },
      ],
    });
    console.log(response.message.content);
    speakText(response.message.content); // Speak out the Ollama response
    return response;
  };

  // Function to match transcript with intents
  const matchIntent = (input: string) => {
    for (let intent of intents) {
      for (let keyword of intent.keywords) {
        if (input.toLowerCase().includes(keyword)) {
          return intent.response;
        }
      }
    }
    return null;
  };

  useEffect(() => {
    if (!SpeechRecognition) {
      return;
    }

    // Initialize the WebSocket connection
    websocketRef.current = new WebSocket("ws://localhost:8080");

    websocketRef.current.onopen = () => {
      console.log("WebSocket connection established");
    };

    websocketRef.current.onclose = () => {
      console.log("WebSocket connection closed");
    };

    websocketRef.current.onerror = (error) => {
      console.error("WebSocket error", error);
    };

    // Initialize SpeechRecognition instance
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interimTranscriptTemp = "";

      // Process the results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptSegment + " ";
        } else {
          interimTranscriptTemp += transcriptSegment;
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => prev + finalTranscript);

        // Match user input to intent
        const intentResponse = matchIntent(finalTranscript);
        if (intentResponse) {
          speakText(intentResponse); // Speak out predefined response for intent
        } else {
          ollamaResponse(finalTranscript); // Use the Ollama response for unknown intent
        }

        if (
          websocketRef.current &&
          websocketRef.current.readyState === WebSocket.OPEN
        ) {
          websocketRef.current.send(
            JSON.stringify({ type: "final", transcript: finalTranscript })
          );
        }
      }

      if (
        interimTranscriptTemp &&
        websocketRef.current &&
        websocketRef.current.readyState === WebSocket.OPEN
      ) {
        websocketRef.current.send(
          JSON.stringify({ type: "interim", transcript: interimTranscriptTemp })
        );
      }

      setInterimTranscript(interimTranscriptTemp);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech recognition error", event);
    };

    // Cleanup on component unmount
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, []);

  const handleStartListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Function to speak the given text
  const speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div>
      <h1>Speech Recognition</h1>
      <button onClick={handleStartListening} disabled={isListening}>
        Start Listening
      </button>
      <button onClick={handleStopListening} disabled={!isListening}>
        Stop Listening
      </button>
      <p>
        <strong>Interim Transcript:</strong> {interimTranscript}
      </p>
      <p>
        <strong>Final Transcript:</strong> {transcript}
      </p>
    </div>
  );
};

export default Transcription;
