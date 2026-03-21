export default async function handler(req, res) {
    const AIRTABLE_PAT = process.env.AIRTABLE_PAT;
    const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
    const AIRTABLE_TABLE = 'Maquinaria';

    if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) {
        return res.status(500).json({ error: "Las credenciales de Airtable no están configuradas en el entorno." });
    }

    try {
        const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE}`, {
            headers: { 
                'Authorization': `Bearer ${AIRTABLE_PAT}` 
            }
        });

        if (!response.ok) {
            throw new Error(`Airtable devolvió un error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        return res.status(200).json(data);
    } catch (error) {
        console.error("Error al consultar Airtable:", error);
        return res.status(500).json({ error: "Fallo al obtener el inventario desde Airtable." });
    }
}
