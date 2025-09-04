
import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";

// Create a context to share the IntersectionObserver instance
const VideoObserverContext = createContext(null);

export function VideoObserverProvider({ children }) {
    const activeVideoRef = useRef(null);
    const [observer, setObserver] = useState(null);
    const debounceTimerRef = useRef(null);
    const pendingActionRef = useRef(null);

    // Debounced function to handle video switching
    const handleVideoSwitch = useCallback((targetVideo, action) => {
        // Clear any pending actions 
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Store the pending action
        pendingActionRef.current = { targetVideo, action };

        // Debounce the actual video switching
        debounceTimerRef.current = setTimeout(() => {
            const { targetVideo: video, action: actionType } = pendingActionRef.current || {};
            
            if (actionType === 'play' && video) {
                // Only switch if this is still the target video
                if (video !== activeVideoRef.current) {
                    // Pause current video
                    if (activeVideoRef.current) {
                        try {
                            activeVideoRef.current.pause();
                            console.log("Paused previous video");
                        } catch (error) {
                            console.warn("Error pausing video:", error);
                        }
                    }

                    // Play new video
                    if (video.readyState >= 2) { // HAVE_CURRENT_DATA or higher
                        video.play().catch((error) => {
                            console.warn("Failed to play video:", error);
                        });
                        activeVideoRef.current = video;
                        console.log("Playing new video after debounce");
                    }
                }
            } else if (actionType === 'pause') {
                // Pause active video
                if (activeVideoRef.current) {
                    try {
                        activeVideoRef.current.pause();
                        activeVideoRef.current = null;
                        console.log("Paused active video after debounce");
                    } catch (error) {
                        console.warn("Error pausing video:", error);
                    }
                }
            }
        }, 150); // 150ms debounce delay
    }, []);

    useEffect(() => {
        const newObserver = new IntersectionObserver(
            (entries) => {
                // Find the most visible video
                let mostVisibleEntry = null;
                let maxRatio = 0.5; // Minimum threshold for consideration

                entries.forEach(entry => {
                    if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
                        maxRatio = entry.intersectionRatio;
                        mostVisibleEntry = entry;
                    }
                });

                if (mostVisibleEntry && mostVisibleEntry.target !== activeVideoRef.current) {
                    // Schedule video to play
                    handleVideoSwitch(mostVisibleEntry.target, 'play');
                } else if (!mostVisibleEntry && activeVideoRef.current) {
                    // Schedule video to pause
                    handleVideoSwitch(null, 'pause');
                }
            },
            {
                threshold: [0.5, 0.75, 1.0], // Reduced thresholds for performance
                rootMargin: "-10% 0px -10% 0px" // Only trigger when well within viewport
            }
        );

        setObserver(newObserver);

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            newObserver.disconnect();
        };
    }, [handleVideoSwitch]);

    return (
        <VideoObserverContext.Provider value={observer}>
            {children}
        </VideoObserverContext.Provider>
    );
}

// Enhanced hook with better error handling
export function useVideoObserver(videoRef) {
    const observer = useContext(VideoObserverContext);

    useEffect(() => {
        const video = videoRef.current;
        
        if (observer && video) {
            // Add loading event listener
            const handleLoadedData = () => {
                console.log("Video ready for observation:", video.src);
            };

            video.addEventListener('loadeddata', handleLoadedData);
            observer.observe(video);

            return () => {
                video.removeEventListener('loadeddata', handleLoadedData);
                observer.unobserve(video);
            };
        }
    }, [observer]);
}