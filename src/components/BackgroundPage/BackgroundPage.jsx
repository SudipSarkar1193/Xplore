import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import "./styles.css";
import LoadingSpinner from "../common/LoadingSpinner";

export const BackgroundPage = ({ showHeading = false, isLoading = false }) => {
	const largeHeaderRef = useRef(null);
	const canvasRef = useRef(null);

	useEffect(() => {
		if (!largeHeaderRef.current || !canvasRef.current) return;

		let width, height, ctx, points, target = { x: window.innerWidth / 2, y: window.innerHeight / 2 }, animateHeader = true;

		initHeader();
		initAnimation();
		addListeners();

		function initHeader() {
			width = window.innerWidth;
			height = window.innerHeight;

			if (largeHeaderRef.current) largeHeaderRef.current.style.height = height + "px";

			const canvas = canvasRef.current;
			canvas.width = width;
			canvas.height = height;
			ctx = canvas.getContext("2d");

			points = [];
			for (let x = 0; x < width; x += width / 20) {
				for (let y = 0; y < height; y += height / 20) {
					const px = x + (Math.random() * width) / 20;
					const py = y + (Math.random() * height) / 20;
					const p = { x: px, originX: px, y: py, originY: py };
					points.push(p);
				}
			}

			points.forEach((p1) => {
				const closest = [];
				points.forEach((p2) => {
					if (p1 !== p2) {
						let placed = false;
						for (let k = 0; k < 5; k++) {
							if (!placed) {
								if (
									!closest[k] ||
									getDistance(p1, p2) < getDistance(p1, closest[k])
								) {
									closest[k] = p2;
									placed = true;
								}
							}
						}
					}
				});
				p1.closest = closest;
			});

			points.forEach((p) => {
				const c = new Circle(p, 2 + Math.random() * 2, "rgba(255,255,255,0.3)");
				p.circle = c;
			});
		}

		function addListeners() {
			if (!("ontouchstart" in window)) {
				window.addEventListener("mousemove", mouseMove);
			}
			window.addEventListener("scroll", scrollCheck);
			window.addEventListener("resize", resize);

			return () => {
				if (!("ontouchstart" in window)) {
					window.removeEventListener("mousemove", mouseMove);
				}
				window.removeEventListener("scroll", scrollCheck);
				window.removeEventListener("resize", resize);
			};
		}

		function mouseMove(e) {
			const posx = e.pageX || e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			const posy = e.pageY || e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
			target.x = posx;
			target.y = posy;
		}

		function scrollCheck() {
			animateHeader = true;
		}

		function resize() {
			width = window.innerWidth;
			height = window.innerHeight;
			if (largeHeaderRef.current) largeHeaderRef.current.style.height = height + "px";
			if (canvasRef.current) {
				canvasRef.current.width = width;
				canvasRef.current.height = height;
			}
		}

		function initAnimation() {
			animate();
			points.forEach(shiftPoint);
		}

		function animate() {
			if (animateHeader) {
				ctx.clearRect(0, 0, width, height);
				points.forEach((point) => {
					const distance = Math.abs(getDistance(target, point));
					if (distance < 4000) {
						point.active = 0.3;
						point.circle.active = 0.6;
					} else if (distance < 20000) {
						point.active = 0.1;
						point.circle.active = 0.3;
					} else if (distance < 40000) {
						point.active = 0.02;
						point.circle.active = 0.1;
					} else {
						point.active = 0;
						point.circle.active = 0;
					}

					drawLines(point);
					point.circle.draw();
				});
			}
			requestAnimationFrame(animate);
		}

		function shiftPoint(p) {
			gsap.to(p, {
				duration: 1 + 1 * Math.random(),
				x: p.originX - 50 + Math.random() * 100,
				y: p.originY - 50 + Math.random() * 100,
				ease: "circ.inOut",
				onComplete: function () {
					shiftPoint(p);
				},
			});
		}

		function drawLines(p) {
			if (!p.active) return;
			p.closest.forEach((closest) => {
				ctx.beginPath();
				ctx.moveTo(p.x, p.y);
				ctx.lineTo(closest.x, closest.y);
				ctx.strokeStyle = `rgba(156,217,249,${p.active})`;
				ctx.stroke();
			});
		}

		function Circle(pos, rad, color) {
			this.pos = pos;
			this.radius = rad;
			this.color = color;

			this.draw = function () {
				if (!this.active) return;
				ctx.beginPath();
				ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI, false);
				ctx.fillStyle = `rgba(156,217,249,${this.active})`;
				ctx.fill();
			};
		}

		function getDistance(p1, p2) {
			return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
		}
	}, []);

	const StyledLoadingSpinner = () => (
		<div className="w-screen flex items-center justify-center -z-10 my-5">
			<span className="mx-4">Please wait </span>
			<LoadingSpinner size="lg" />
		</div>
	);

	return (
		<div ref={largeHeaderRef} id="large-header" className="large-header">
			<canvas ref={canvasRef} id="demo-canvas"></canvas>

			<h1 className="main-title">
				{(showHeading || isLoading) && (
					<>
						<span className="font-bold btn-outline w-full text-slate-600 active:bg-white active:text-black">
							Connect &{" "}
							<span className="permanent-marker-regular text-white animate-pulse hover:animate-bounce active:animate-bounce ">
								Xplore
							</span>
						</span>

						<StyledLoadingSpinner />

						<div className="open-sans-medium w-full text-orange-300 hover:animate-bounce active:animate-bounce ">
							Developed By : Sudip Sarkar
						</div>
					</>
				)}
			</h1>

			<StyledLoadingSpinner />
		</div>
	);
};
