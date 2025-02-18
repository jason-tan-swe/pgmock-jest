
// import { PostgresMock } from '../dist/main.cjs'
// import * as pg from "pg";
// import postgres, { PostgresType, type Sql } from 'postgres'

// interface SqlWithMock extends Sql {
//     mock?: PostgresMock;
// }

// describe("Integration with", () => {
//     // describe.skip("pg", () => {
//     //     it('SELECT', async () => {
//     //         const mock = await PostgresMock.create();
//     //         const client = new pg.Client(mock.getNodePostgresConfig());
        
//     //         await client.connect();
            
//     //         expect(await client.query('SELECT $1::text as message', ['Hello world!'])).toMatchObject({ rows: [{ message: 'Hello world!' }] });
        
//     //         await client.end();
//     //         mock.destroy();
//     //     }, 30000)
//     // })

//     describe('postgres', () => {
//         let sql: Sql;
//         let mock: PostgresMock;

//         beforeEach(async () => {
//             mock = await PostgresMock.create();
//         });
    
//         afterEach(async () => {
//             try {
//                 if (sql) {
//                     await sql.end({ timeout: 5000 }).catch(() => {});
//                 }
//                 if (mock) {
//                     await mock.destroy();
//                 }
//                 // Force close any remaining connections
//                 await new Promise(resolve => setTimeout(resolve, 100));
//             } catch (err) {
//                 console.error('Cleanup error:', err);
//             } 
//             await new Promise(resolve => setTimeout(resolve, 500));
//         });
    
//         it('INSERT', async () => {
//             mock = await PostgresMock.create();
//             const connectionString = await mock.listen(7777);
//             sql = postgres(connectionString, {
//                 // Add timeout settings to prevent hanging
//                 idle_timeout: 2,
//                 max_lifetime: 5,
//                 max: 1,
//                 connect_timeout: 10,
//                 onclose: () => {},
//             });
    
//             try {
//                 // Create tables
//                 await sql`
//                     CREATE TABLE IF NOT EXISTS room (
//                         id SERIAL PRIMARY KEY,
//                         name TEXT NOT NULL
//                     );
//                 `;
//                 await sql`
//                     CREATE TABLE IF NOT EXISTS document (
//                         id SERIAL PRIMARY KEY,
//                         name TEXT NOT NULL,
//                         room_id INTEGER NOT NULL REFERENCES room(id)
//                     );
//                 `;
    
//                 await sql`INSERT INTO room (id, name) VALUES (${'1'}, ${'Room One'});`;
//                 await sql`INSERT INTO document (name, room_id) VALUES (${'DOCUMENT NAME TWO'}, ${'1'});`;  
                
//                 const documents = await sql`
//                     SELECT id, name
//                     FROM document
//                     WHERE room_id = ${'1'}
//                 `;
                
//                 expect(documents).toEqual(expect.arrayContaining([
//                     expect.objectContaining({ name: "DOCUMENT NAME TWO" })
//                 ]));
//             } catch (error) {
//                 console.error('Test error:', error);
//                 throw error;
//             } finally {
//                 try {
//                     await sql?.end({ timeout: 1000 }).catch(() => {});
//                 } catch (err) {
//                     console.error('Cleanup error in finally:', err);
//                 }
//             }
//         }, 30000);
//     });
// })


import { PostgresMock } from '../dist/main.cjs'
import postgres, { PostgresType, type Sql } from 'postgres'

interface SqlWithMock extends Sql {
    mock?: PostgresMock;
}

describe("Integration with", () => {
    describe('postgres', () => {
        let sql: Sql;
        let mock: PostgresMock;
        let cleanup: (() => void)[] = [];

        beforeEach(async () => {
            // Create mock only once
            mock = await PostgresMock.create();
            const connectionString = await mock.listen(7777);
            sql = postgres(connectionString, {
                idle_timeout: 2,
                max_lifetime: 5,
                max: 1,
                connect_timeout: 10,
                onclose: () => {},
                // onend: () => {},
            });
        });
    
        afterEach(async () => {
            try {
                // Close SQL connection first
                if (sql) {
                    const sqlEndPromise = sql.end({ timeout: 1000 })
                        .catch(e => console.error('SQL end error:', e));
                    
                    const timeoutPromise = new Promise<void>((_, reject) => {
                        const id = setTimeout(() => {
                            reject(new Error('SQL end timeout'));
                        }, 1500);
                        cleanup.push(() => clearTimeout(id));
                    });
    
                    await Promise.race([sqlEndPromise, timeoutPromise]);
                }
    
                // Then destroy mock
                if (mock) {
                    await mock.destroy();
                }
            } catch (err) {
                console.error('Cleanup error:', err);
            } finally {
                // Clean up any remaining timeouts
                cleanup.forEach(fn => fn());
                cleanup = [];
            }
        });
    
        it('INSERT', async () => {
            try {
                await sql`
                    CREATE TABLE IF NOT EXISTS room (
                        id SERIAL PRIMARY KEY,
                        name TEXT NOT NULL
                    );
                `;
                await sql`
                    CREATE TABLE IF NOT EXISTS document (
                        id SERIAL PRIMARY KEY,
                        name TEXT NOT NULL,
                        room_id INTEGER NOT NULL REFERENCES room(id)
                    );
                `;
    
                await sql`INSERT INTO room (id, name) VALUES (${'1'}, ${'Room One'});`;
                await sql`INSERT INTO document (name, room_id) VALUES (${'DOCUMENT NAME TWO'}, ${'1'});`;  
                
                const documents = await sql`
                    SELECT id, name
                    FROM document
                    WHERE room_id = ${'1'}
                `;
                
                expect(documents).toEqual(expect.arrayContaining([
                    expect.objectContaining({ name: "DOCUMENT NAME TWO" })
                ]));
            } catch (error) {
                console.error('Test error:', error);
                throw error;
            }
        }, 30000);
    });
});