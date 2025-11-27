import React, { useState, useEffect } from "react";
import axios from "axios";

const CardDeck = () => {
    // Base URL Variable for the Deck of Cards API
    const baseURL = "https://www.deckofcardsapi.com/api/deck";

    // State Variables
    const [deckId, setDeckId] = useState(null); // ID of the deck from API
    const [cards, setCards] = useState([]); // Array to hold drawn cards
    const [error, setError] = useState(null); // Handle errors
    const [cardsRemaining, setCardsRemaining] = useState(52); // Track remaining cards
    const [isShuffling, setIsShuffling] = useState(false); // Track shuffle progress

    // Get a new deck when the component mounts
    useEffect(() => {
        async function getDeck() {
            try {
                const res = await axios.get(`${baseURL}/new/shuffle/?deck_count=1`);
                setDeckId(res.data.deck_id);
                setCardsRemaining(res.data.remaining);
                console.log(res.data.deck_id);
                console.log(res.data.remaining);
            } catch (e) {
                setError(`Error getting deck: ${e.message}`);
            }
        }
        getDeck();
    }, []);

    // Function to draw a card
    const drawCard = async (numCards = 1) => {
        if (!deckId || cardsRemaining === 0) return;

        try {
            const res = await axios.get(`${baseURL}/${deckId}/draw/?count=${numCards}`);
            const newCards = res.data.cards.map((card) => ({
                ...card,
                rotation: Math.random() * 1 - 0.5, // Random rotation between -0.5 and 0.5 turns
                xShift: Math.random() * 40 - 20, // Random x shift between -20px and 20px
                yShift: Math.random() * 40 - 20, // Random y shift between -20px and 20px
            }));
            setCards((prevCards) => [...prevCards, ...newCards]); // Append new cards
            setCardsRemaining(res.data.remaining); // Update remaining cards
        } catch (e) {
            setError(`Error drawing card: ${e.message}`);
        }
    };

    // Function to shuffle the deck
    const shuffleDeck = async () => {
        if (!deckId) return;

        setIsShuffling(true); // Disable the shuffle button
        try {
            await axios.get(`${baseURL}/${deckId}/shuffle/`);
            setCards([]); // Clear all drawn cards from the screen
            setCardsRemaining(52); // Reset the remaining cards count
        } catch (e) {
            setError(`Error shuffling deck: ${e.message}`);
        } finally {
            setIsShuffling(false); // Re-enable the shuffle button
        }
    };

    // Render the component
    return (
        <div>
            {/* Display error messages */}
            {error && (
                <p style={{ color: "red" }}>
                    {error}
                    <button onClick={() => setError(null)}>Dismiss</button>
                </p>
            )}

            {/* Display remaining cards */}
            <p>Cards Remaining: {cardsRemaining}</p>

            {/* Draw Card Button */}
            {cardsRemaining > 0 ? (
                <button onClick={() => drawCard(1)}>Draw Card</button>
            ) : (
                <p>All cards have been drawn!</p>
            )}

            {/* Shuffle Deck Button */}
            <button onClick={shuffleDeck} disabled={isShuffling}>
                {isShuffling ? "Shuffling..." : "Shuffle Deck"}
            </button>

            {/* Display drawn cards as a scattered pile */}
            <div
                className="card-box"
                style={{
                    position: "relative",
                    width: "300px",
                    height: "400px",
                    margin: "20px auto",
                }}
            >
                {cards.map((card, index) => (
                    <img
                        key={card.code}
                        src={card.image}
                        alt={`${card.value} of ${card.suit}`}
                        style={{
                            position: "absolute",
                            top: `calc(50% + ${card.yShift}px)`, // Apply random y shift
                            left: `calc(50% + ${card.xShift}px)`, // Apply random x shift
                            transform: `translate(-50%, -50%) rotate(${card.rotation}turn)`,
                            width: "100px",
                            height: "150px",
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default CardDeck;