import React, { useEffect, useRef, useState } from "react";
import Die from "./Die";
import { nanoid } from "nanoid";
import Confetti from "react-confetti";

export default function App() {
    const [dice, setDice] = useState(generateAllNewDice());
    const [time, setTime] = useState(0); // Timer state
    const [rollCount, setRollCount] = useState(0); // Roll counter state
    const [timerRunning, setTimerRunning] = useState(true);

    const buttonRef = useRef(null);

    const gameWon =
        dice.every((die) => die.isHeld) &&
        dice.every((die) => die.value === dice[0].value);

    // Start and update the timer
    useEffect(() => {
        let timer;
        if (timerRunning && !gameWon) {
            timer = setInterval(() => setTime((prev) => prev + 1), 1000);
        }
        return () => clearInterval(timer); // Cleanup on unmount
    }, [timerRunning, gameWon]);

    // Focus button when the game is won
    useEffect(() => {
        if (gameWon) {
            buttonRef.current.focus();
            setTimerRunning(false); // Stop the timer
        }
    }, [gameWon]);

    function generateAllNewDice() {
        return new Array(10).fill(0).map(() => ({
            value: Math.ceil(Math.random() * 6),
            isHeld: false,
            id: nanoid(),
        }));
    }

    function rollDice() {
        if (!gameWon) {
            setDice((oldDice) =>
                oldDice.map((die) =>
                    die.isHeld ? die : { ...die, value: Math.ceil(Math.random() * 6) }
                )
            );
            setRollCount((prev) => prev + 1); // Increment roll count
        } else {
            setDice(generateAllNewDice());
            setTime(0); // Reset timer
            setRollCount(0); // Reset roll count
            setTimerRunning(true); // Restart the timer
        }
    }

    function hold(id) {
        setDice((oldDice) =>
            oldDice.map((die) =>
                die.id === id ? { ...die, isHeld: !die.isHeld } : die
            )
        );
    }

    const diceElements = dice.map((dieObj) => (
        <Die
            key={dieObj.id}
            value={dieObj.value}
            isHeld={dieObj.isHeld}
            hold={() => hold(dieObj.id)}
        />
    ));

    return (
        <main>
            {gameWon && <Confetti />}
            <div aria-live="polite" className="sr-only">
                {gameWon && (
                    <p>
                        Congratulations! You won! Press "New Game" to start again.
                    </p>
                )}
            </div>
            <h1 className="title">Tenzies</h1>
            <p className="instructions">
                Roll until all dice are the same. Click each die to freeze it at its
                current value between rolls.
            </p>
            <div className="stats">
                <p>Time: {time}s</p>
                <p>Rolls: {rollCount}</p>
            </div>
            <div className="dice-container">{diceElements}</div>
            <button ref={buttonRef} className="roll-dice" onClick={rollDice}>
                {gameWon ? "New Game" : "Roll"}
            </button>
        </main>
    );
}
