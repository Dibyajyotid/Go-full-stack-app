import React from 'react'

// import '../app/'

interface Card {
    id: number;
    name: string;
    email: string;
}

// const CardComponent: React.FC<{ card: Card }> = ({ card }) => {
//     return (
//         <div className='bg-wgite shadow-lg rounded-lg p-2 mb-2 hover:bg-gray-100'>
//             <div className='text-sm text-gray-600'>Id: {card.id}</div>
//             <div className='text-lg font-semibold text-gray-800'>{card.name}</div>
//             <div className='text-md text-gray-700'>{card.email}</div>
//         </div>
//     )
// }

// import  { useEffect, useRef } from 'react';

// const CardComponent: React.FC<{ card: Card }> = ({ card }) => {
//     const cardRef = useRef<HTMLDivElement>(null);

//     useEffect(() => {
//         const cardElement = cardRef.current;

//         if (!cardElement) return;

//         // Add mousemove and mouseleave event listeners
//         const handleMouseMove = (e: MouseEvent) => {
//             const rect = cardElement.getBoundingClientRect();
//             const x = e.clientX - rect.left; // X coordinate inside the card
//             const y = e.clientY - rect.top; // Y coordinate inside the card

//             const centerX = rect.width / 2;
//             const centerY = rect.height / 2;

//             // Calculate rotation values
//             const rotateX = (y - centerY) / 10; // Adjust intensity by changing divisor
//             const rotateY = (centerX - x) / 10;

//             cardElement.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
//         };

//         const handleMouseLeave = () => {
//             cardElement.style.transform = 'rotateX(0) rotateY(0) scale(1)';
//         };

//         cardElement.addEventListener('mousemove', handleMouseMove);
//         cardElement.addEventListener('mouseleave', handleMouseLeave);

//         // Cleanup event listeners on unmount
//         return () => {
//             cardElement.removeEventListener('mousemove', handleMouseMove);
//             cardElement.removeEventListener('mouseleave', handleMouseLeave);
//         };
//     }, []);

//     return (
//         <div
//             ref={cardRef}
//             className="bg-white shadow-lg rounded-lg p-2 mb-2 hover:bg-gray-100 transition-transform duration-300 card3d">
//             <div className="text-sm text-gray-600">Id: {card.id}</div>
//             <div className="text-lg font-semibold text-gray-800">{card.name}</div>
//             <div className="text-md text-gray-700">{card.email}</div>
//         </div>
//     );
// };


// export default CardComponent

import { useEffect, useRef } from 'react';

const CardComponent: React.FC<{ card: Card }> = ({ card }) => {
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const cardElement = cardRef.current;

        if (!cardElement) return;

        // Add mousemove and mouseleave event listeners
        const handleMouseMove = (e: MouseEvent) => {
            const rect = cardElement.getBoundingClientRect();
            const x = e.clientX - rect.left; // X coordinate inside the card
            const y = e.clientY - rect.top; // Y coordinate inside the card

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Calculate rotation values
            const rotateX = -(y - centerY) / 10; // Adjust intensity by changing divisor
            const rotateY = (x - centerX) / 10;

            // Calculate shadow position
            const shadowX = (centerX - x) / 15; // Shadow offset on X-axis
            const shadowY = (y - centerY) / 15; // Shadow offset on Y-axis

            cardElement.style.transform = `
                perspective(1000px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                scale(1.3)
            `;
            cardElement.style.boxShadow = `${shadowX}px ${shadowY}px 50px rgba(0, 0, 0, 0.3)`;
        };

        const handleMouseLeave = () => {
            cardElement.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
            cardElement.style.boxShadow = '0px 10px 20px rgba(0, 0, 0, 0.2)';
        };

        cardElement.addEventListener('mousemove', handleMouseMove);
        cardElement.addEventListener('mouseleave', handleMouseLeave);

        // Cleanup event listeners on unmount
        return () => {
            cardElement.removeEventListener('mousemove', handleMouseMove);
            cardElement.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <div
            ref={cardRef}
            className="bg-white shadow-2xl rounded-lg p-4 mb-4 hover:bg-gray-500 hover:text-yellow-50 hover:z-10 transition-transform duration-300 ease-out mr-2 w-full">
            <div className="text-sm text-gray-600 hover:text-cyan-400">Id: {card.id}</div>
            <div className="text-lg font-semibold text-gray-800 hover:text-cyan-400">{card.name}</div>
            <div className="text-md text-gray-700 hover:text-cyan-400">{card.email}</div>
        </div>
    );
};

export default CardComponent;
