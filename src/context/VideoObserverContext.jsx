
import { createContext, useContext, useEffect, useRef, useState } from "react";

// Create a context to share the IntersectionObserver instance
const VideoObserverContext = createContext(null);

export function VideoObserverProvider({ children }) {
    // Track which video is currently playing
    const activeVideoRef = useRef(null);
    
    // Store the IntersectionObserver instance in state
    const [observer, setObserver] = useState(null);

    useEffect(() => {
        // Create a new IntersectionObserver instance
        const newObserver = new IntersectionObserver(
            (entries) => {
                console.log("Observer entries:", entries.length);
                
                // Find the video that is MOST visible in the viewport
                let mostVisibleEntry = null;
                let maxRatio = 0;
                
                entries.forEach(entry => {
                    if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
                        maxRatio = entry.intersectionRatio;
                        mostVisibleEntry = entry;
                    }
                });

                console.log("Most visible entry:", mostVisibleEntry, "ratio:", maxRatio);
                
                // Case 1: A new "most visible" video appeared
                if (mostVisibleEntry && mostVisibleEntry.target !== activeVideoRef.current) {
                    console.log("Switching to new video");
                    
                    // Pause the previously active video (if any)
                    if (activeVideoRef.current) {
                        activeVideoRef.current.pause();
                        console.log("Paused previous video");
                    }
                    
                    // Play the new most visible video
                    const videoToPlay = mostVisibleEntry.target;
                    videoToPlay.play().catch((error) => {
                        console.error("Failed to play video:", error);
                    });
                    
                    // Set it as the currently active video
                    activeVideoRef.current = videoToPlay;
                    console.log("Playing new video");
                    
                // Case 2: No video is sufficiently visible → pause the active one
                } else if (!mostVisibleEntry && activeVideoRef.current) {
                    console.log("No video visible, pausing active video");
                    activeVideoRef.current.pause();
                    activeVideoRef.current = null;
                }
            },
            {
                threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0], // Multiple thresholds for better tracking
                rootMargin: "0px" // No margin
            }
        );

        console.log("Created new observer");
        
        // Save observer to state so it can be shared via context
        setObserver(newObserver);

        // Cleanup when provider unmounts
        return () => {
            console.log("Disconnecting observer");
            newObserver.disconnect();
        };
    }, []);

    return (
        <VideoObserverContext.Provider value={observer}>
            {children}
        </VideoObserverContext.Provider>
    );
}

// Custom hook to use the observer in video components
export function useVideoObserver(videoRef) {
    const observer = useContext(VideoObserverContext);

    useEffect(() => {
        const video = videoRef.current;
        
        if (observer && video) {
            console.log("Observing video:", video);
            
            // Start observing this video
            observer.observe(video);

            // Cleanup function to unobserve when component unmounts or ref changes
            return () => {
                console.log("Unobserving video:", video);
                observer.unobserve(video);
            };
        }
    }, [observer]); // Re-run if observer changes
}