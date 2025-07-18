// extracted from original renderer.js mock systems
// TODO: replace mocks with real API calls
const mockAgentResponses = {
  scheduler: [
    "Reminder set for 2:30 PM.",
    "You have 3 events scheduled today.",
    "Meeting with Sarah moved to 4:00 PM.",
    "Calendar synchronized with external systems.",
  ],
  weather: [
    "72°F and sunny in Boston.",
    "Chance of rain at 40% this afternoon.",
    "Current temperature: 68°F, feels like 71°F.",
    "UV index is moderate. Sunscreen recommended.",
  ],
  home: [
    "Smart lights disabled.",
    "Thermostat set to 72°F.",
    "Security system armed.",
    "All devices synchronized.",
  ],
  system: [
    "All systems operational.",
    "Running diagnostics... Complete.",
    "Network connection stable.",
    "Power levels optimal.",
  ],
  assistant: [
    "How may I assist you today?",
    "Processing your request...",
    "Standing by for further instructions.",
    "Task completed successfully.",
  ],
};

function selectMockAgent(input) {
  const lowercaseInput = input.toLowerCase();
  if (
    lowercaseInput.includes('remind') ||
    lowercaseInput.includes('schedule') ||
    lowercaseInput.includes('calendar') ||
    lowercaseInput.includes('meeting')
  ) {
    return 'scheduler';
  } else if (
    lowercaseInput.includes('weather') ||
    lowercaseInput.includes('temperature') ||
    lowercaseInput.includes('rain') ||
    lowercaseInput.includes('sunny')
  ) {
    return 'weather';
  } else if (
    lowercaseInput.includes('light') ||
    lowercaseInput.includes('temperature') ||
    lowercaseInput.includes('home') ||
    lowercaseInput.includes('thermostat')
  ) {
    return 'home';
  } else if (
    lowercaseInput.includes('system') ||
    lowercaseInput.includes('status') ||
    lowercaseInput.includes('diagnostic')
  ) {
    return 'system';
  } else {
    return 'assistant';
  }
}

function getMockAgentResponse(input) {
  const agentType = selectMockAgent(input);
  const responses = mockAgentResponses[agentType];
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  return {
    system: agentType.toUpperCase(),
    response: randomResponse,
    timestamp: new Date().toISOString(),
    confidence: Math.random() * 0.3 + 0.7,
  };
}

async function processUserInput(input) {
  return new Promise((resolve) => {
    const delay = Math.random() * 1000 + 500;
    setTimeout(() => {
      resolve(getMockAgentResponse(input));
    }, delay);
  });
}

export { selectMockAgent, getMockAgentResponse, processUserInput };
