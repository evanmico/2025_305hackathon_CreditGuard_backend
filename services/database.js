import dotenv from "dotenv";
import connectDB from "../config/azure";
import SQL from 'sql-template-strings';

//dotenv.config();

export const storeCard = async (bankName, cardName) => {
    try {
        // check if a bank with the same name already exists in db and insert if it doesn't exist, returning the new ID
        const checkBankSQLobj = SQL`SELECT ID FROM bank WHERE name = ${bankName} LIMIT 1`;
        let rows;
        [rows,] = await connectDB.query(checkBankSQLobj);
        // what I'd like to use, but it might not work as a SQL object
        const bankInsertSQLobj = SQL`
        START TRANSACTION;
            INSERT INTO bank (name) VALUES (${bankName});
            SELECT LAST_INSERT_ID();
        COMMIT;
        `;
        let bankID;
        if((rows == undefined || rows.length === 0)) {
            [[{ ID: bankID }],] = await connectDB.query(bankInsertSQLobj);
        } else {
            bankID = rows[0].ID;
        }

        // check if a card with the same name and same bank already exists in the db and insert if it doesn't exist, returning the new ID
        const checkCardSQLobj = SQL`SELECT ID FROM card WHERE name = ${cardName} AND bankID = ${bankID} LIMIT 1`;
        [rows,] = await connectDB.query(checkCardSQLobj);
        const cardInsertSQLobj = SQL`
        START TRANSACTION;
            INSERT INTO card (name, bankID) VALUES (${cardName}, ${bankID});
            SELECT LAST_INSERT_ID();
        COMMIT;
        `;
        let cardID;
        if((rows == undefined || rows.length === 0)) {
            [[{ ID: cardID }],] = await connectDB.query(cardInsertSQLobj);
        } else {
            cardID = rows[0].ID;
        }
/*
        const connection = await connectDB.getConnection();
        const insertQuery = `INSERT INTO benefits (benefit_name, description) VALUES (?, ?)`;
        const values = benefits.map(benefit => [benefit["Benefit Name"], benefit.description]);
        await connection.query(insertQuery, [values]);
        connection.release(); */ // might be necessary to reserve a connection to send two independent queries like above transaction and get back id
        return {
            "bankInfo": {
                "ID":bankID,
                "name":bankName
            },
            "cardInfo": {
                "ID":cardID,
                "name":cardName
            }
        }
    } catch (error) {
        console.error("Error storing card:", error);
        throw error;
    }
}
export const storeBenefits = async (cardID,benefits) => {
    /*
    benefits is array of objects like this
    [
        {
        benefitName: small str value,
        benefitDescription: long text of full benefit detail
        },
        {
        benefitName: small str value,
        benefitDescription: long text of full benefit detail
        },
        {
        benefitName: small str value,
        benefitDescription: long text of full benefit detail
        }
    ]
    */
    try {

        // go through all benefit names in db and if they don't exist, insert them
        const insertBenefitNameSQLobj = SQL`INSERT INTO benefit (name) VALUES`;
        const checkBenefitIDSQLobj = SQL`SELECT ID from benefit WHERE name = `;
        const connection = await connectDB.getConnection();
        
        // creates a version of original benefits array with an ID for each one pulled from the db (or gotten upon insert)

        const benefitsWithIDs = benefits.map(async (benefit) => {
            [rows,] = await connection.query({...checkBenefitIDSQLobj}.append(SQL`${benefit.benefitName}`));
            let benefitID;
            if((rows == undefined || rows.length === 0)) {
                await connection.query({...insertBenefitNameSQLobj}.append(SQL`(${benefit.benefitName})`));
                [[{ ID: benefitID }],] = await connection.query(SQL`SELECT LAST_INSERT_ID()`);
            } else {
                benefitID = rows[0].ID;
            }
            return {
                ...benefit,
                "benefitID" : benefitID
            }
        });
        connection.release();
        // declare start of sql query objects to be built and run on db to add benefits
        const card_benefitInsertSQLobj = SQL`INSERT INTO card_benefit (cardID, benefitID) VALUES`;
        const full$benefitInsertSQLobj = SQL`INSERT INTO full$benefit (cardID, benefitID, text) VALUES`;
        // append each benefit value to the sql query object that should be added
        benefitsWithIDs.forEach( (benefit, index) => {
            if(index+1 == benefitsWithIDs.length){
                card_benefitInsertSQLobj.append(SQL`(${cardID}, ${benefit.benefitID})`);
                full$benefitInsertSQLobj.append(SQL`(${cardID}, ${benefit.benefitID}, ${benefit.benefitDescription})`);
            }else {
                card_benefitInsertSQLobj.append(SQL`(${cardID}, ${benefit.benefitID}),`);
                full$benefitInsertSQLobj.append(SQL`(${cardID}, ${benefit.benefitID}, ${benefit.benefitDescription}),`);
            };
        });
        // add all benefits to db with 2 queries
        await connectDB.query(card_benefitInsertSQLobj);
        await connectDB.query(full$benefitInsertSQLobj);

     
    } catch (error) {
        console.error("Error storing benefits:", error);
        throw error;
    }
}

export async function competitorCardBenefits(cardID){
    try {
        
        const competitorCardIdsQuery = SQL`SELECT pCard.ID, pCard.name, sum(b.ID) as sum
                                            FROM
                                                (SELECT ID FROM card WHERE ID <> "givenID") AS pCard
                                                    (INNER JOIN card_benefit cLink ON pCard.ID = cLink.cardID) 
                                                        INNER JOIN benefit b ON cLink.benefitID=b.ID
                                        GROUP BY pCard.ID
                                        DESC
                                        LIMIT 3;`;
        
        const [competitorCardIds] = await connectDB.query(competitorCardIdsQuery);

        if(!competitorCardIds || competitorCardIds.length === 0){
            throw new Error('Cannot retrieve competitors card Ids', competitorCardIds.error.message)
        }

        const test = SQL`SELECT pCard.ID, pCard.name, sum(b.ID) as sum
                                            FROM
                                                (SELECT ID FROM card WHERE ID <> "givenID") AS pCard
                                                    (INNER JOIN card_benefit cLink ON pCard.ID = cLink.cardID) 
                                                        INNER JOIN benefit b ON cLink.benefitID=b.ID`
        
        const benefitsFromCompetitorCardIdQuery = SQL`SELECT b.ID, b.name
                                                        FROM
                                                            (SELECT ID FROM card WHERE ID = "competitorCardId") AS pCard
                                                                (INNER JOIN card_benefit cLink ON pCard.ID = cLink.cardID) 
                                                                    INNER JOIN benefit b ON cLink.benefitID=b.ID;`;
        //return back names and benefits
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

async function insertBank(bankName){

}