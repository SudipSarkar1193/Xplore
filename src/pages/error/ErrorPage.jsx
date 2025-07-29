import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const ErrorPage = () => {
	return (
		<div className="w-screen h-screen flex items-center justify-center flex-col overflow-hidden">
			<>
				<div className="text-2xl md:text-4xl font-bold text-white shadow-lg p-6 rounded-lg transform scale-95 transition-transform duration-300 hover:scale-105 fade-in text-center">
					<h2 className="animate-pulse">404 Not Found !</h2>
					<h2>Please log in again 😓</h2>
				</div>
				<Link to="/login" className="self-center">
					<button className="btn rounded-full btn-primary text-white w-24">
						Log in
					</button>
				</Link>
			</>
		</div>
	);
};

export default ErrorPage;
