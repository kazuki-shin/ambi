"use client";

import { Button } from "@/components/ui/button"; // Assuming this path is correct for ambi-os
import * as React from "react";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Assuming this path is correct for ambi-os
import { useConversation } from "@11labs/react"; // This will likely need to be updated if you have a custom hook for Ambi OS

async function requestMicrophonePermission() {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    return true;
  } catch {
    console.error("Microphone permission denied");
    return false;
  }
}

async function getSignedUrl(): Promise<string> {
  const response = await fetch("/api/get-signed-url"); 
  if (!response.ok) {
    throw Error("Failed to get signed url");
  }
  const data = await response.json();
  return data.signedUrl;
}

export function AmbiOSConversation() {
  console.log("AmbiOSConversation rendering"); // Log component render

  const [isMuted, setIsMuted] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState("/avatar-states/idle.png"); // Default avatar
  const [hasError, setHasError] = useState(false); // New state for error
  const [horizontalOffset, setHorizontalOffset] = useState(0); // State for horizontal movement

  const conversation = useConversation({
    onConnect: () => {
      console.log("connected");
      setHasError(false); // Reset error on new connection
      setCurrentAvatar("/avatar-states/listening.png"); // Set in useEffect
    },
    onDisconnect: () => {
      console.log("disconnected");
      setCurrentAvatar("/avatar-states/idle.png"); // Set in useEffect
    },
    onError: error => {
      console.log(error);
      alert("An error occurred during the conversation");
      setHasError(true);
      setCurrentAvatar("/avatar-states/error.png"); // Set in useEffect
    },
    onMessage: message => {
      console.log(message);
    },
  });

  // Log if conversation object reference changes
  const prevConversationRef = useRef(conversation);
  useEffect(() => {
    if (prevConversationRef.current !== conversation) {
      console.log("Conversation object reference CHANGED");
      prevConversationRef.current = conversation;
    } else {
      // console.log("Conversation object reference STABLE"); // Reduce noise if stable
    }
  }, [conversation]);

  const effectRunCount = useRef(0);
  const sessionSetupAttemptedRef = useRef(false); // Ref to prevent re-looping session setup

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    effectRunCount.current += 1;
    console.log(`Main session effect running. Count: ${effectRunCount.current}. Setup attempted: ${sessionSetupAttemptedRef.current}`);

    // Guard: Only proceed if startSession is available and setup hasn't been attempted yet.
    if (!conversation.startSession || sessionSetupAttemptedRef.current) {
      if (sessionSetupAttemptedRef.current) console.log("Session setup already attempted, skipping full re-init.");
      if (!conversation.startSession) console.log("conversation.startSession not available, skipping init.");
      return;
    }

    const initializeSession = async () => {
      console.log("Initializing session...");
      // Set the flag *before* critical async operations that might trigger re-render
      sessionSetupAttemptedRef.current = true; 

      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        alert("Microphone access was denied. Please enable it in your browser settings.");
        sessionSetupAttemptedRef.current = false; // Allow retry if permission changes
        return;
      }
      try {
        console.log("Getting signed URL for session...");
        const signedUrl = await getSignedUrl();
        console.log("Attempting to start session with signed URL...");
        await conversation.startSession({ signedUrl });
        console.log("Ambi OS Conversation started automatically.");
        // Successfully started, keep sessionSetupAttemptedRef.current = true
      } catch (error) {
        console.error("Failed to start Ambi OS conversation:", error);
        alert("Could not start the Ambi OS conversation. Please check the console for details.");
        sessionSetupAttemptedRef.current = false; // Allow retry if starting session failed
      }
    };

    initializeSession();

    // Cleanup function
    return () => {
      console.log(`Cleanup for main session effect. Status: ${conversation.status}`);
      // Only end session if it was genuinely connected and presumably started by this logic path.
      // The sessionSetupAttemptedRef helps gate this, though status is also important.
      if (conversation.status === "connected" && conversation.endSession) {
        console.log("Attempting to end session on unmount/re-run for AmbiOSConversation effect");
        conversation.endSession().catch(err => console.error("Error ending session on unmount:", err));
        console.log("Ambi OS Conversation ended on unmount.");
        // Reset flag if component unmounts, allowing re-init if it remounts.
        // This specific reset might need adjustment based on desired lifecycle behavior.
        sessionSetupAttemptedRef.current = false; 
      }
    };
  }, [conversation.startSession, conversation.endSession, conversation.status]); // Dependencies that define the session's capabilities and state for cleanup

  // Separate useEffect for avatar logic based on conversation state
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (hasError) {
      setCurrentAvatar("/avatar-states/error.png");
    } else if (conversation && conversation.status === "connected") {
      if (conversation.isSpeaking) {
        setCurrentAvatar("/avatar-states/speaking.png");
      } else {
        setCurrentAvatar("/avatar-states/listening.png");
      }
    } else { 
      setCurrentAvatar("/avatar-states/idle.png");
    }
  }, [hasError, conversation.status, conversation.isSpeaking]); // Granular dependencies

  useEffect(() => {
    let timeoutId: number | undefined;

    const moveAvatar = () => {
      // Decide if to move (e.g., 60% chance)
      if (Math.random() < 0.6) {
        const newOffset = (Math.random() - 0.5) * 80; // Range -40px to +40px
        setHorizontalOffset(newOffset);
      }

      // Random interval for next move attempt (e.g., 3 to 7 seconds for decision, plus 1s for animation)
      const randomInterval = Math.random() * 4000 + 3000;
      timeoutId = setTimeout(moveAvatar, randomInterval) as unknown as number;
    };

    // Start the first move attempt after an initial delay
    const initialDelay = Math.random() * 2000 + 1000; // 1 to 3 seconds
    timeoutId = setTimeout(moveAvatar, initialDelay) as unknown as number;

    return () => {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    };
  }, []); // Runs once on mount

  const toggleMute = () => {
    setIsMuted(!isMuted);
    console.log(isMuted ? "Unmuting Ambi OS" : "Muting Ambi OS");
  };

  return (
    <div className={"flex justify-center items-center min-h-screen min-w-full"}>
      <Card className={"rounded-3xl"}>
        <CardContent className="pt-6">
          <CardHeader className="p-4">
            <CardTitle className={"text-center text-xl mb-4"}>
              Ambi OS Status
            </CardTitle>
            <div className="text-center text-lg">
              {hasError ? "Error - Please check connection or permissions" :
                conversation.status === "connected"
                ? conversation.isSpeaking
                  ? `Ambi OS is speaking`
                  : "Ambi OS is listening"
                : conversation.status === "connecting"
                ? "Ambi OS Connecting..."
                : "Ambi OS Disconnected"}
            </div>
          </CardHeader>
          <div className={"flex flex-col gap-y-6 items-center"}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentAvatar}
              alt="Companion Avatar"
              className="fixed bottom-0 left-1/2 w-[clamp(300px,80vw,1000px)] h-[clamp(350px,60vh,650px)] object-contain mb-8 z-10 transition-transform duration-1000 ease-in-out drop-shadow-[3px_10px_10px_rgba(0,0,0,0.50)]"
              style={{ transform: `translateX(calc(-50% + ${horizontalOffset}px))` }}
            />

            {conversation.status === "connected" && !hasError && (
              <Button
                variant={"outline"}
                className={"rounded-full w-full max-w-xs mt-4"} 
                size={"lg"}
                onClick={toggleMute}
              >
                {isMuted ? "Unmute Ambi OS" : "Mute Ambi OS"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 