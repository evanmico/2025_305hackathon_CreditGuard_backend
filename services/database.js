import mysql2 from "mysql2/promise";
import dotenv from "dotenv";
import connectDB from "../config/azure";

dotenv.config();


export async function storeBenefits(
    cardName,
    bankName,
    benefits
) {
    try {
        const connection = await connectDB.getConnection();
        const insertQuery = `INSERT INTO benefits (benefit_name, description) VALUES (?, ?)`;
        const values = benefits.map(benefit => [benefit["Benefit Name"], benefit.description]);
        await connection.query(insertQuery, [values]);
        connection.release();
    } catch (error) {
        console.error("Error storing benefits:", error);
        throw error;
    }
}

export async function returnCompetitorCardBenefits(cardName){
    try {
        const connection = await connectDB.getConnection();

        const competitorsCardsQuery = `SELECT ID, name FROM card WHERE name IS NOT ${cardName}`;
        const [competitorCardIds] = await connection.query(competitorsCardsQuery);

        if(!competitorCardIds || competitorCardIds.length === 0){
            throw new Error('Cannot retrieve competitors cards')
        }

        const benefitsIdQuery = "SELECT benefitID FROM card_benefit WHERE card_id IS (?)";
        const benefitNameQuery = "SELECT name FROM benefit WHERE ID IS (?)";
        const benefitDescriptionQuery = "SELECT text FROM full$benefit WHERE cardID IS (?) AND";

        for(competitorCardId of competitorCardIds){
            const [benefitIds] = await connection.query(benefitsIdQuery, [competitorCardId]);
            if(!benefitIds || benefitIds.length === 0){
                throw new Error(`Cannot retrieve benefits for ${competitorCardId}`)
            }

            //ughhhhh this is so ugly and stupid and uhhhghghghghghghghhggh

            for(benefitId of benefitIds){
                const [benefits] = await connection.query(benefitsIdQuery, [benefitId]);
                if(!benefits || benefits.length === 0){
                    throw new Error(`Cannot retrieve benefits for ${benefitId} in card ${competitorCardId}`)
                }
                competitorCardId.benefit = benefits
            }
        }

        
        connection.release();
        return rows;
    } catch (error) {
        console.error("Error retrieving competitor cards:", error);
        throw error;
    }
}