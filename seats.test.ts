import { assertEquals } from "https://deno.land/std@0.116.0/testing/asserts.ts";

import { expandCliToJson, parseSeatsCommand, Venue } from './seats.ts';

Deno.test("Clean, simple test", () => {
    const seats = parseSeatsCommand("b1 b2 b3 b4 b5")!;
    assertEquals(
        new Venue(10, 5).bestSeats(2,seats),
        ["b2", "b3"]
    );
})

// The following tests thoroughly test the assignment
// So they generate the whole JSON and then parse it
Deno.test("picks two closest seats", () => {
    const {desiredSeats, json: {venue, seats}} = expandCliToJson("2 10 10 e4 e5 e6 e7 e8 e9 b4 b5")!;
    assertEquals(
        new Venue(venue.layout.rows, venue.layout.columns).bestSeats(desiredSeats,seats),
        ["b4","b5"]
    );
})

Deno.test("picks three seats", () => {
    const {desiredSeats, json: {venue, seats}} = expandCliToJson("3 10 10 e4 e5 e6 e7 e8 e9 b4 b5")!;
    assertEquals(
        new Venue(venue.layout.rows, venue.layout.columns).bestSeats(desiredSeats,seats),
        ["e4","e5","e6"]
    );
})
Deno.test("handles too big a group well", () => {
    const {desiredSeats, json: {venue, seats}} = expandCliToJson("20 10 10 e4 e5 e6 e7 e8 e9 b4 b5")!;
    assertEquals(
        new Venue(venue.layout.rows, venue.layout.columns).bestSeats(desiredSeats,seats),
        []
    );
})

Deno.test("inablity to sit three in a row", () => {
    const {desiredSeats, json: {venue, seats}} = expandCliToJson("3 10 10 b5 c5 d5 d6 e5 f5 f4")!;
    assertEquals(
        new Venue(venue.layout.rows, venue.layout.columns).bestSeats(desiredSeats,seats),
        []
    );
})
Deno.test("odd number of columns: picks the front middle single seat when it can", () => {
    const {desiredSeats, json: {venue, seats}} = expandCliToJson("1 11 11 a5 a6 d5 d6 e5 f5 f4")!;
    assertEquals(
        new Venue(venue.layout.rows, venue.layout.columns).bestSeats(desiredSeats,seats),
        ["a6"]
    );
})
Deno.test("even number of columns: picks left of the front middle single seat", () => {
    const {desiredSeats, json: {venue, seats}} = expandCliToJson("1 10 10 a5 a6 d5 d6 e5 f5 f4")!;
    assertEquals(
        new Venue(venue.layout.rows, venue.layout.columns).bestSeats(desiredSeats,seats),
        ["a5"]
    );
})
Deno.test("10 rows 12 columns example, 1 seat", () => {
    const {desiredSeats, json: {venue, seats}} = expandCliToJson("1 10 12 a1 a2 a3 a4 a5 a6 a7 a8 a9 a10 a11 a12 b3 b4 b5 b6 b7 b8 b9")!;
    assertEquals(
        new Venue(venue.layout.rows, venue.layout.columns).bestSeats(desiredSeats,seats),
        ["a6"]
    );
})

Deno.test("10 rows 12 columns example, 3 seats", () => {
    const {desiredSeats, json: {venue, seats}} = expandCliToJson("3 10 12 a1 a2 a3 a4 a5 a6 a7 a8 a9 a10 a11 a12 b3 b4 b5 b6 b7 b8 b9")!;
    assertEquals(
        new Venue(venue.layout.rows, venue.layout.columns).bestSeats(desiredSeats,seats),
        ["a5", "a6", "a7"]
    );
})
Deno.test("10 rows 5 columns example, 2 seats", () => {
    const {desiredSeats, json: {venue, seats}} = expandCliToJson("2 10 5 b1 b2 b3 b4 b5")!;
    assertEquals(
        new Venue(venue.layout.rows, venue.layout.columns).bestSeats(desiredSeats,seats),
        ["b2", "b3"]
    );
})

Deno.test("expansion from cli to json", () => {
    const json = {
        "venue": {
            "layout": { 
                "rows": 10,
                "columns": 50
            }
        },
        "seats": {
            "a1": {
                "id": "a1",
                "row": "a",
                "column": 1,
                "status": "AVAILABLE"
            },
            "b5": {
                "id": "b5",
                "row": "b",
                "column": 5,
                "status": "AVAILABLE"
            },
            "h7": {
                "id": "h7",
                "row": "h",
                "column": 7,
                "status": "AVAILABLE"
            }
        }
    };
    assertEquals(json, expandCliToJson("2 10 50 a1 b5 h7").json);
});