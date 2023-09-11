import {createEffect, createSignal, onCleanup, onMount} from "solid-js";
import {isServer} from "solid-js/web";
import {DEFAULT_STATE, HEIGHT, WIDTH} from "./constants";
import SnakeDisplay from "./display";
import type {Direction, XY} from "./types";

export default function SnakeGame() {
	// snake states
	const [direction, setDirection] = createSignal<Direction>('up');
	const [snake, setSnake] = createSignal<XY[]>(DEFAULT_STATE);
	const [food, setFood] = createSignal<XY>([12, 10]);

	// game states
	const [gameStarted, setGameStarted] = createSignal<boolean>(false);
	const [gameOver, setGameOver] = createSignal<boolean>(false);

	// game stats
	const [highScore, setHighScore] = createSignal<number>(0);

	// get score
	const calcScore = () => snake().length - DEFAULT_STATE.length;

	// get highscore from localstorage
	onMount(() => {
		const highScore = localStorage.getItem('highScore');
		if (highScore) setHighScore(parseInt(highScore));
	});

	// set highscore to localstorage
	createEffect(() => {
		if (gameOver()) {
			const score = calcScore();
			if (score > parseInt(localStorage.getItem('highScore') || '0')) {
				setHighScore(score);
				localStorage.setItem('highScore', score.toString());
			}
		}
	});

	// reset
	const reset = () => {
		setDirection('up');
		setSnake(DEFAULT_STATE);
		setFood([12, 10]);
		setGameStarted(false);
		setGameOver(false);
	}

	// extra frame of death delay
	let deathDelay = 0;

	// store game loop interval
	let interval: number | null = null;

	// actual game loop
	// start when gameStarted is true
	createEffect(() => {
		if (gameStarted()) {
			// clear old interval if it exists
			if (interval) clearInterval(interval);

			// start new interval
			interval = setInterval(() => {
				if (!gameStarted()) return;

				const snakeCopy = Array.from(snake()) as XY[];
				const snakeHead = Array.from(snakeCopy[0]) as XY;

				// process snake movement
				switch (direction()) {
					case 'up':
						snakeHead[1] -= 1;
						break;
					case 'down':
						snakeHead[1] += 1;
						break;
					case 'left':
						snakeHead[0] -= 1;
						break;
					case 'right':
						snakeHead[0] += 1;
						break;
				}

				// check if snake is out of bounds
				if (snakeHead[0] < 0 || snakeHead[0] >= WIDTH || snakeHead[1] < 0 || snakeHead[1] >= HEIGHT) {
					if (deathDelay === 0) {
						deathDelay = 1;
						return;
					}

					setGameOver(true);
					setGameStarted(false);
					return;
				}

				// check if snake has eaten food
				var grow = snakeHead[0] === food()[0] && snakeHead[1] === food()[1];

				// respawn food & increment score
				if (grow) {
					setFood([Math.floor(Math.random() * WIDTH), Math.floor(Math.random() * HEIGHT)]);
				}

				// // check if snake has eaten itself
				if (snakeCopy.some(([x, y]) => x === snakeHead[0] && y === snakeHead[1])) {
					setGameOver(true);
					setGameStarted(false);
					return;
				}

				// set the new snake head
				snakeCopy.unshift(snakeHead);

				// remove the tail if snake hasn't eaten food
				if (!grow) snakeCopy.pop();

				// update snake state
				setSnake(snakeCopy);
				deathDelay = 0;
			}, 100);
		} else {
			// clear interval on death
			if (interval) clearInterval(interval);
		}
	});

	// keyboard controls
	const moveDown = () => direction() != 'up' && setDirection('down');
	const moveUp = () => direction() != 'down' && setDirection('up');
	const moveLeft = () => direction() != 'right' && setDirection('left');
	const moveRight = () => direction() != 'left' && setDirection('right');

	// event listeners
	const handleKeyDown = (e: KeyboardEvent) => {
		switch (e.key) {
			case 'ArrowUp':
			case 'w':
			case 'z':
				moveUp();
				break;

			case 'ArrowLeft':
			case 'a':
			case 'q':
				moveLeft();
				break;

			case 'ArrowDown':
			case 's':
				moveDown();
				break;

			case 'ArrowRight':
			case 'd':
				moveRight();
				break;

			default:
				return;
		}

		e.preventDefault();
	};

	// swipe controls
	let touchStartX = 0;
	let touchStartY = 0;
	let snakeGame: HTMLDivElement = null as any;

	const handleTouchStart = (e: TouchEvent) => {
		const {clientX, clientY} = e.touches[0];
		touchStartX = clientX;
		touchStartY = clientY;

		e.preventDefault();
	}

	const handleTouchEnd = (e: TouchEvent) => {
		const {clientX, clientY} = e.changedTouches[0];

		const dX = clientX - touchStartX;
		const dY = clientY - touchStartY;

		if (Math.abs(dX) > Math.abs(dY)) {
			if (dX > 0) moveRight();
			else moveLeft();
		} else {
			if (dY > 0) moveDown();
			else moveUp();
		}

		e.preventDefault();
	}

	// register on game start
	createEffect(() => {
		if (isServer) return;

		if (gameStarted()) {
			// keyboard
			window.addEventListener('keydown', handleKeyDown);

			// swipe
			snakeGame.addEventListener('touchstart', handleTouchStart);
			snakeGame.addEventListener('touchend', handleTouchEnd);
		} else {
			// keyboard
			window.removeEventListener('keydown', handleKeyDown);

			// swipe
			snakeGame.removeEventListener('touchstart', handleTouchStart);
			snakeGame.removeEventListener('touchend', handleTouchEnd);
		}
	});

	// lifecycle
	onCleanup(() => {
		if (isServer) return;

		// stop game loop
		if (interval) clearInterval(interval);

		// keyboard
		!isServer && window.removeEventListener('keydown', handleKeyDown);

		// swipe
		snakeGame.removeEventListener('touchstart', handleTouchStart);
		snakeGame.removeEventListener('touchend', handleTouchEnd);
	});

	{
		/**
		 * TODO: Change this system of background and cover the screen with
		 * */
	}
	return (
		<div class="snake-gradient w-full py-[4.88rem] xl:py-[15.88rem] xl:px-16" ref={snakeGame}>
			<div
				class="border-black snake-box-gradient shadow-snakeWindow backdrop-blur-[32px] p-4 rounded-lg xl:w-fit w-full flex flex-col sm:flex-row mx-auto">
				<div class="mx-auto">
					<SnakeDisplay
						snake={snake}
						food={food}
						gameStarted={gameStarted}
						direction={direction}
						startGame={() => {
							reset();
							setGameStarted(true);
						}}
					/>
				</div>
			</div>
		</div>
	)
}