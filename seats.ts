// Retaining the data format from JSON for the assignment, but
// we could just turn this into a hash set of free seat ids
export type SeatMap = {[seatId: string]: {
    id: string;
    row: string;
    column: number;
    status: string;
}};

export class Venue {
    constructor(
        private rows: number,
        private columns: number
    ) {}

    distanceFromOptimal(row: number, col: number): number {
        const optimalColumn = Math.ceil(this.columns/2);
        const optimalRow = 0;

        return Math.sqrt(
            ((row-optimalRow)*(row-optimalRow)) + ((col-optimalColumn)*(col-optimalColumn))
        );
    }

    getSeatId(row: number, col: number): string {
        const rowLetter = String.fromCharCode("a".charCodeAt(0) + row);
        return rowLetter+col;
    }

    public bestSeat(seats: SeatMap): string | null {
        let bestDistance = Number.MAX_VALUE;
        let bestSeat: string | null = null;
        Object.values(seats)
            .filter(seat => seat.status == 'AVAILABLE')
            .forEach(seat => {
                const rowNumber = seat.row.charCodeAt(0) - "a".charCodeAt(0);
                const distance = this.distanceFromOptimal(rowNumber, seat.column);
                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestSeat = seat.id;
                }
            });
        return bestSeat;
    }

    public bestSeats(desiredSeats: number, seats: SeatMap): string[] {
        if (desiredSeats < 1) {
            return [];
        }
        if (desiredSeats > this.columns) {
            return [];
        }

        let bestDistanceForTheGroup = Number.MAX_VALUE;
        let bestRow: number | null = null;
        let bestRightmostSeat: number | null = null;

        for (let row=0; row<this.rows; row++) {
            let slidingWindowSize = 0;
            let totalDistanceForWindow = 0.0; 
            let availableSeatsInWindow = 0;
            let col = 1;
            
            while (col <= this.columns) {
                if (slidingWindowSize == desiredSeats) {
                    // remove the seat from the beginning of
                    // the window to make room for the next one
                    const leftmostSeatColumn = (col-slidingWindowSize);
                    const leftmostSeat = seats[ this.getSeatId(row, leftmostSeatColumn) ];
                    
                    if (leftmostSeat?.status == 'AVAILABLE') {
                        totalDistanceForWindow -= this.distanceFromOptimal(row,leftmostSeatColumn);
                        availableSeatsInWindow -= 1;
                    }
                    slidingWindowSize -= 1;
                }
                slidingWindowSize += 1;
                // add next element to the end of the window
                const nextSeat = seats[ this.getSeatId(row, col) ];
                if (nextSeat?.status == 'AVAILABLE') {
                    totalDistanceForWindow += this.distanceFromOptimal(row,col);
                    availableSeatsInWindow += 1;
                }

                if (availableSeatsInWindow == desiredSeats) {
                    if (totalDistanceForWindow < bestDistanceForTheGroup) {
                        bestDistanceForTheGroup = totalDistanceForWindow;
                        bestRow = row;
                        bestRightmostSeat = col;
                    }
                }

                col += 1;
            }
        }

        const ret: string[] = [];
        if (bestRow !== null && bestRightmostSeat !== null) {
            for(let col = bestRightmostSeat-desiredSeats+1; col <= bestRightmostSeat; col++) {
                ret.push(this.getSeatId(bestRow, col));
            }
        }
        return ret;
    }
}

export function parseSeatsCommand(seatsListStr: string): SeatMap {
    const seats: SeatMap = {};
    seatsListStr.trim().split(" ").forEach(seatId => {
        const rowLetter = seatId.substr(0,1);
        const column = seatId.substr(1);
        seats[ seatId ] = {
            id: seatId,
            row: rowLetter,
            column: parseInt(column), 
            status: 'AVAILABLE'
        }
    });
    return seats;
}

export function expandCliToJson(str: string): {desiredSeats: number, json: any} {
    const matches = /^(\d+)\s(\d+)\s(\d+)\s(.+)$/i.exec(str);

    if (matches == null) {
        console.error('Format: [desired seats] [rows] [columns] [list of available seats], e.g. 10 20 e7 e8 e9 e10 e11 e12 e13');
        throw new Error('Invalid input format');
    }
    
    const desiredSeats = parseInt(matches[1]);
    const rows = parseInt(matches[2]);
    const columns = parseInt(matches[3]);
    const seats = parseSeatsCommand(matches[4]);
    
    return {
        desiredSeats,
        json: {
            venue: {
                layout: {
                    rows,
                    columns
                }
            },
            seats
        }
    }
}


let desiredSeats: number | null = null;
let json = null;

if (Deno?.args.length == 2) {
    console.info('Reading JSON from the second cli argument...');
    
    desiredSeats = parseInt(Deno.args[0]),
    json = JSON.parse(Deno.args[1])
} else if(Deno?.args.length > 2) {
    console.info('Parsing CLI list of available seats...');
    
    const result = expandCliToJson( Deno.args.join(" ") );
    desiredSeats = result.desiredSeats;
    json = result.json
} else if(Deno?.args.length == 1) {
    console.info('Reading JSON from stdin...');

    const stdinContent = await Deno.readAll(Deno.stdin);
    const jsonStr = new TextDecoder().decode(stdinContent);

    if (!jsonStr) {
        console.error('Expected JSON on stdin. Try: deno run seats.ts 2 < data.json');
        Deno.exit(1);
    }

    desiredSeats = parseInt(Deno.args[0]);
    json = JSON.parse(jsonStr);
} else {
    console.log('Try: deno run seats.ts [desired seats] [rows] [columns] [space-separated list of available seats]');
}

if (desiredSeats) {
    console.info('Venue layout', json?.venue.layout);
    console.info('Desired seats', desiredSeats);
    
    const seats = new Venue(
        json?.venue.layout.rows,
        json?.venue.layout.columns
    )
    .bestSeats(desiredSeats, json.seats);
    
    console.info('Best seats', seats);    
}
    
export {}