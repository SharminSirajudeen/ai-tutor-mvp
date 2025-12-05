import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// The URL of our new FastAPI backend.
// In a real deployment, this would come from an environment variable.
const BACKEND_URL = 'http://localhost:8000/api/v1/chat';

export async function POST(req: Request) {
    try {
        const { messages, sessionId: incomingSessionId } = await req.json();

        if (!messages || messages.length === 0) {
            return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
        }

        // Ensure we have a session ID. If the client doesn't provide one, create a new one.
        const sessionId = incomingSessionId || uuidv4();
        const lastUserMessage = messages[messages.length - 1];

        console.log(`Forwarding message to backend for session: ${sessionId}`);

        // Make a request to our new Python backend
        const backendResponse = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: lastUserMessage.content,
                session_id: sessionId,
            }),
        });

        if (!backendResponse.ok) {
            const errorBody = await backendResponse.text();
            console.error('Error from backend:', backendResponse.status, errorBody);
            throw new Error(`Backend request failed with status ${backendResponse.status}`);
        }

        const backendData = await backendResponse.json();

        // The frontend UI expects a specific JSON structure with "content" and "drawCommands".
        // Our LangGraph agent currently returns a simple {"response": "..."}.
        // We will adapt the backend's response to fit the frontend's needs.
        // As our agent becomes more advanced (Phase 4), it will generate real drawCommands.
        const formattedResponse = {
            content: backendData.response || "Sorry, I encountered an issue.",
            drawCommands: backendData.drawCommands || [], // Prepare for future functionality
            sessionId: sessionId, // Send the session ID back to the client
        };

        return NextResponse.json(formattedResponse);

    } catch (error) {
        console.error('Error in chat route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
