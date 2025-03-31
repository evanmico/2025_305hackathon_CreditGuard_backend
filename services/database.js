import dotenv from "dotenv";
import connectDB from "../config/azure.js";
import SQL from 'sql-template-strings';

//dotenv.config();

export const storeCard = async (bankName, cardName) => {
    try {
        // check if a bank with the same name already exists in db and insert if it doesn't exist, returning the new ID
        const checkBankSQLobj = SQL`SELECT ID FROM bank WHERE name = ${bankName} LIMIT 1`;
        let rows;
        [rows,] = await connectDB.query(checkBankSQLobj);
        // what I'd like to use, but it might not work as a SQL object
        const bankInsertSQLobj = SQL`INSERT INTO bank (name) VALUES (${bankName})`;
        const selectLastSQLobj = SQL`SELECT LAST_INSERT_ID() AS ID`;
        let bankID;
        const connection = await connectDB.getConnection();
        if((rows == undefined || rows.length === 0)) {
            await connection.query(bankInsertSQLobj);
            console.log(await connection.query(selectLastSQLobj));
            [[{ ID: bankID }],] = await connection.query(selectLastSQLobj);
        } else {
            bankID = rows[0].ID;
        }

        // check if a card with the same name and same bank already exists in the db and insert if it doesn't exist, returning the new ID
        const checkCardSQLobj = SQL`SELECT ID FROM card WHERE name = ${cardName} AND bankID = ${bankID} LIMIT 1`;
        [rows,] = await connectDB.query(checkCardSQLobj);
        const cardInsertSQLobj = SQL`INSERT INTO card (name, bankID) VALUES (${cardName}, ${bankID})`;

        let cardID;
        if((rows == undefined || rows.length === 0)) {
            await connection.query(cardInsertSQLobj);
            [[{ ID: cardID }],] = await connection.query(selectLastSQLobj);
        } else {
            cardID = rows[0].ID;
        }
        connection.release();
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
        //const insertBenefitNameSQLobj = SQL`INSERT INTO benefit (name) VALUES`;
        //const checkBenefitIDSQLobj = SQL`SELECT ID from benefit WHERE name = `;
        const connection = await connectDB.getConnection();
        const selectLastSQLobj = SQL`SELECT LAST_INSERT_ID() AS ID`;
        // creates a version of original benefits array with an ID for each one pulled from the db (or gotten upon insert)
        console.log(benefits);
        const benefitsWithIDs = await Promise.all(Array(...benefits).map(async (benefit) => {
            let checkBenefitIDSQLobj = SQL`SELECT ID from benefit WHERE name = `;
            let [rows,] = await connection.query(checkBenefitIDSQLobj.append(SQL`${benefit.benefitName}`));
            let benefitID;
            if((rows == undefined || rows.length === 0)) {
                let insertBenefitNameSQLobj = SQL`INSERT INTO benefit (name) VALUES`;
                console.log(benefit.benefitName);
                await connection.query(insertBenefitNameSQLobj.append(SQL`(${benefit.benefitName})`));
                [[{ ID: benefitID }],] = await connection.query(selectLastSQLobj);
            } else {
                benefitID = rows[0].ID;
            }
            console.log(benefitID);
            console.log({...benefit,"benefitID":benefitID})
            return {
                ...benefit,
                "benefitID" : benefitID
            }
        }));
        console.log(benefitsWithIDs[0]);
        connection.release();
        console.log(benefitsWithIDs[0]);
        // declare start of sql query objects to be built and run on db to add benefits
        const card_benefitInsertSQLobj = SQL`INSERT IGNORE INTO card_benefit (cardID, benefitID) VALUES`;
        const full$benefitInsertSQLobj = SQL`INSERT IGNORE INTO full$benefit (cardID, benefitID, text) VALUES`;
        // append each benefit value to the sql query object that should be added
        benefitsWithIDs.forEach( (benefit, index) => {
            console.log(benefit.benefitID);
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
        
        const competitorCardsSQLobj = SQL`SELECT pCard.ID, pCard.name, sum(pCard.ID) AS sum
    FROM
        (SELECT c.ID, c.name FROM card c WHERE ID <> 5) AS pCard
            INNER JOIN card_benefit cLink ON pCard.ID = cLink.cardID
                INNER JOIN benefit b ON cLink.benefitID=b.ID
    GROUP BY pCard.ID
    ORDER BY pCard.id DESC
    LIMIT 3`;
        
        const [competitorCards,] = await connectDB.query(competitorCardsSQLobj);

        if(!competitorCards || competitorCards.length === 0){
            throw new Error('Cannot retrieve competitors card Ids', competitorCards.error.message)
        };
        
        const compCardsAndBenefits = competitorCards.map(async (card) => {
            let competitorCardBenefitsSQLobj = SQL`
                                                SELECT b.ID AS benefitID, b.name AS benefitName
                                                FROM(SELECT ID FROM card WHERE ID = 1) AS pCard
                                                INNER JOIN card_benefit cLink ON pCard.ID = cLink.cardID
                                                INNER JOIN benefit b ON cLink.benefitID=b.ID
                                                `;
            let [benefits,]  = await connectDB.query(competitorCardBenefitsSQLobj);
            return {
                ...card,
                benefits: benefits
            };
        });
        return compCardsAndBenefits;

    } catch (error) {
        console.error("Error retrieving competitor cards:", error);
        throw error;
    }
}
// not needed cause storeCard does this automatically
/*
async function insertBank(bankName){

}
*/