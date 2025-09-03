import { createContext, useContext, useEffect, useRef, useState } from "react";

const VideoObserverContext = createContext(null);

export function VideoObserverProvider({ children }) {
	const observerRef = useRef(null);
	const [observer, setObserver] = useState(null);

	useEffect(() => {
		// Create observer
		const obs = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					const video = entry.target;

					if (entry.isIntersecting) {
						// Video is at least 50% visible
						console.log("Video entering viewport, playing:", video);
						video.play().catch((error) => {
							console.error("Failed to play video:", error);
						});
					} else {
						// Video is less than 50% visible
						console.log("Video leaving viewport, pausing:", video);
						video.pause();
					}
				});
			},
			{
				threshold: 0.5,
				rootMargin: "0px 0px -50px 0px", // Add some margin to trigger earlier
			}
		);

		observerRef.current = obs;
		setObserver(obs);

		return () => {
			obs.disconnect();
		};
	}, []);

	return (
		<VideoObserverContext.Provider value={observer}>
			{children}
		</VideoObserverContext.Provider>
	);
}

export function useVideoObserver(videoRef) {
	const observer = useContext(VideoObserverContext);

	useEffect(() => {
		const video = videoRef.current;

		if (observer && video) {
			console.log("Observing video:", video);
			observer.observe(video);

			return () => {
				console.log("Unobserving video:", video);
				observer.unobserve(video);
			};
		}
	}, [observer, videoRef]);
}
