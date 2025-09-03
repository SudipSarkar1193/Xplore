import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthContextProvider } from "./context/AuthContext.jsx"; 
import { ModalProvider } from "./context/ModalContext.jsx";
import { VideoObserverProvider } from "./context/VideoObserverContext.jsx";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
		},
	},
});

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<BrowserRouter basename="/">
			<QueryClientProvider client={queryClient}>
				<AuthContextProvider>
					<ModalProvider>
						<VideoObserverProvider>
							<App />
						</VideoObserverProvider>
					</ModalProvider>
				</AuthContextProvider>
			</QueryClientProvider>
		</BrowserRouter>
	</React.StrictMode>
);
