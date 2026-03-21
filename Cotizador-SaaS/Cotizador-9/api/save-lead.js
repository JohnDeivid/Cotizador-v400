export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const AIRTABLE_PAT = process.env.AIRTABLE_PAT;
    const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
    const AIRTABLE_TABLE = 'Leads_Cotizaciones';

    if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) {
        return res.status(500).json({ error: "Las credenciales de Airtable no están configuradas en el entorno." });
    }

    try {
        // En Vercel, req.body ya viene parseado como objeto JSON si el Content-Type es application/json
        const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

        const AirtableBody = {
            records: [
                {
                    fields: payload
                }
            ]
        };

        const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE}`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${AIRTABLE_PAT}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(AirtableBody)
        });

        if (!response.ok) {
            const errBody = await response.text();
            return res.status(response.status).json({ error: "Error de Airtable", details: errBody });
        }

        const data = await response.json();

        return res.status(200).json({ success: true, id: data.records[0].id });
    } catch (error) {
        console.error("Error al guardar lead en Airtable:", error);
        return res.status(500).json({ error: "Fallo al guardar la cotización en Airtable.", details: error.message });
    }
}
