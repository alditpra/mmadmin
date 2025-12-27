import { google } from 'googleapis';

const SPREADSHEET_ID = import.meta.env.SPREADSHEET_ID;

// Create authenticated Sheets client using OAuth access token
function getSheets(accessToken: string) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    return google.sheets({ version: 'v4', auth });
}

// ============ CARS ============

export interface Car {
    id: string;
    status: string;
    brand: string;
    model: string;
    year: number;
    price: number;
    mileage: number;
    transmission: string;
    fuel: string;
    color: string;
    bpkb: string;
    description: string;
    features: string;
    image1: string;
    image2: string;
    image3: string;
    image4: string;
    image5: string;
    video_url: string;
    featured: boolean;
    badge: string;
    sold_date: string;
    date_added: string;
}

function rowToCar(row: string[]): Car {
    return {
        id: row[0] || '',
        status: row[1] || 'available',
        brand: row[2] || '',
        model: row[3] || '',
        year: parseInt(row[4]) || 0,
        price: parseInt(row[5]) || 0,
        mileage: parseInt(row[6]) || 0,
        transmission: row[7] || '',
        fuel: row[8] || '',
        color: row[9] || '',
        bpkb: row[10] || '',
        description: row[11] || '',
        features: row[12] || '',
        image1: row[13] || '',
        image2: row[14] || '',
        image3: row[15] || '',
        image4: row[16] || '',
        image5: row[17] || '',
        video_url: row[18] || '',
        featured: row[19]?.toUpperCase() === 'TRUE',
        badge: row[20] || '',
        sold_date: row[21] || '',
        date_added: row[22] || '',
    };
}

function carToRow(car: Partial<Car>): string[] {
    return [
        car.id || '',
        car.status || 'available',
        car.brand || '',
        car.model || '',
        String(car.year || ''),
        String(car.price || ''),
        String(car.mileage || ''),
        car.transmission || '',
        car.fuel || '',
        car.color || '',
        car.bpkb || '',
        car.description || '',
        car.features || '',
        car.image1 || '',
        car.image2 || '',
        car.image3 || '',
        car.image4 || '',
        car.image5 || '',
        car.video_url || '',
        car.featured ? 'TRUE' : 'FALSE',
        car.badge || '',
        car.sold_date || '',
        car.date_added || '',
    ];
}

export async function getAllCars(accessToken: string): Promise<Car[]> {
    const sheets = getSheets(accessToken);
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'cars!A2:W',
    });

    const rows = response.data.values || [];
    return rows.map(rowToCar);
}

export async function getCarById(accessToken: string, id: string): Promise<Car | null> {
    const cars = await getAllCars(accessToken);
    return cars.find(car => car.id === id) || null;
}

export async function addCar(accessToken: string, car: Partial<Car>): Promise<void> {
    const sheets = getSheets(accessToken);
    const row = carToRow(car);

    await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'cars!A:W',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [row] },
    });
}

async function findCarRowIndex(accessToken: string, id: string): Promise<number | null> {
    const sheets = getSheets(accessToken);
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'cars!A:A',
    });

    const rows = response.data.values || [];
    for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] === id) {
            return i + 1; // 1-indexed for Sheets
        }
    }
    return null;
}

export async function updateCar(accessToken: string, id: string, car: Partial<Car>): Promise<boolean> {
    const rowIndex = await findCarRowIndex(accessToken, id);
    if (!rowIndex) return false;

    const sheets = getSheets(accessToken);
    const row = carToRow({ ...car, id });

    await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `cars!A${rowIndex}:W${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [row] },
    });

    return true;
}

export async function deleteCar(accessToken: string, id: string): Promise<boolean> {
    const rowIndex = await findCarRowIndex(accessToken, id);
    if (!rowIndex) return false;

    const sheets = getSheets(accessToken);

    // Get spreadsheet to find cars sheet ID
    const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
    });

    const carsSheet = spreadsheet.data.sheets?.find(
        s => s.properties?.title === 'cars'
    );

    if (!carsSheet?.properties?.sheetId && carsSheet?.properties?.sheetId !== 0) return false;

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
            requests: [{
                deleteDimension: {
                    range: {
                        sheetId: carsSheet.properties.sheetId,
                        dimension: 'ROWS',
                        startIndex: rowIndex - 1,
                        endIndex: rowIndex,
                    },
                },
            }],
        },
    });

    return true;
}

// ============ SETTINGS ============

export interface Settings {
    [key: string]: string;
}

export async function getSettings(accessToken: string): Promise<Settings> {
    const sheets = getSheets(accessToken);
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'settings!A2:B',
    });

    const rows = response.data.values || [];
    const settings: Settings = {};

    for (const row of rows) {
        if (row[0]) {
            settings[row[0]] = row[1] || '';
        }
    }

    return settings;
}

export async function updateSettings(accessToken: string, settings: Settings): Promise<void> {
    const sheets = getSheets(accessToken);

    // Get current settings to preserve order
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'settings!A2:B',
    });

    const rows = response.data.values || [];
    const updatedRows = rows.map(row => {
        const key = row[0];
        if (key && settings[key] !== undefined) {
            return [key, settings[key]];
        }
        return row;
    });

    await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: 'settings!A2:B',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: updatedRows },
    });
}

// ============ TESTIMONIALS ============

export interface Testimonial {
    id: string;
    type: 'screenshot' | 'photo' | 'video';
    media: string;
    name: string;
    car: string;
    quote: string;
    rating: number;
}

function rowToTestimonial(row: string[]): Testimonial {
    return {
        id: row[0] || '',
        type: (row[1] as Testimonial['type']) || 'photo',
        media: row[2] || '',
        name: row[3] || '',
        car: row[4] || '',
        quote: row[5] || '',
        rating: parseInt(row[6]) || 5,
    };
}

function testimonialToRow(t: Partial<Testimonial>): string[] {
    return [
        t.id || '',
        t.type || 'photo',
        t.media || '',
        t.name || '',
        t.car || '',
        t.quote || '',
        String(t.rating || 5),
    ];
}

export async function getAllTestimonials(accessToken: string): Promise<Testimonial[]> {
    const sheets = getSheets(accessToken);
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'testimonials!A2:G',
    });

    const rows = response.data.values || [];
    return rows.map(rowToTestimonial);
}

export async function addTestimonial(accessToken: string, testimonial: Partial<Testimonial>): Promise<void> {
    const sheets = getSheets(accessToken);
    const row = testimonialToRow(testimonial);

    await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'testimonials!A:G',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [row] },
    });
}

async function findTestimonialRowIndex(accessToken: string, id: string): Promise<number | null> {
    const sheets = getSheets(accessToken);
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'testimonials!A:A',
    });

    const rows = response.data.values || [];
    for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] === id) {
            return i + 1;
        }
    }
    return null;
}

export async function updateTestimonial(accessToken: string, id: string, testimonial: Partial<Testimonial>): Promise<boolean> {
    const rowIndex = await findTestimonialRowIndex(accessToken, id);
    if (!rowIndex) return false;

    const sheets = getSheets(accessToken);
    const row = testimonialToRow({ ...testimonial, id });

    await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `testimonials!A${rowIndex}:G${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [row] },
    });

    return true;
}

export async function deleteTestimonial(accessToken: string, id: string): Promise<boolean> {
    const rowIndex = await findTestimonialRowIndex(accessToken, id);
    if (!rowIndex) return false;

    const sheets = getSheets(accessToken);

    const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
    });

    const testimonialsSheet = spreadsheet.data.sheets?.find(
        s => s.properties?.title === 'testimonials'
    );

    if (!testimonialsSheet?.properties?.sheetId && testimonialsSheet?.properties?.sheetId !== 0) return false;

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
            requests: [{
                deleteDimension: {
                    range: {
                        sheetId: testimonialsSheet.properties.sheetId,
                        dimension: 'ROWS',
                        startIndex: rowIndex - 1,
                        endIndex: rowIndex,
                    },
                },
            }],
        },
    });

    return true;
}
