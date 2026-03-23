import { z } from 'zod';

const LeadSchema = z.object({
    "Razón Social / Constructora": z.string().min(1),
    "Responsable de Obra": z.string().min(1),
    "Teléfono Móvil": z.string().min(1),
    "Ubicación / Proyecto": z.string().min(1),
    "Equipos Cotizados": z.string(),
    "Fecha de Inicio": z.string(),
    "Fecha de Fin": z.string(),
    "Régimen de Turnos": z.string(),
    "Suministro Diésel": z.string(),
    "Zona Logística": z.string(),
    "Modalidad Operador": z.string(),
    "Seguro Incluido": z.boolean(),
    "Subtotal Renta Máquinas": z.number(),
    "Bonificación Volumen": z.number(),
    "Costo Operador": z.number(),
    "Suministro Combustible": z.number(),
    "Flete Logístico": z.number(),
    "Seguro Póliza": z.number(),
    "Viáticos": z.number(),
    "Subtotal Operativo": z.number(),
    "ITBIS": z.number(),
    "Total Presupuesto": z.number(),
    "Estado de Cotización": z.string(),
    "quote_id": z.string().min(1),
    "monto_total": z.number()
});

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
        const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        
        // Add mandatory company_id
        payload.company_id = "MAQ-RENT-001";

        // Validate payload
        const validation = LeadSchema.safeParse(payload);
        if (!validation.success) {
            return res.status(400).json({ 
                error: "Invalid lead data", 
                details: validation.error.format() 
            });
        }

        const AirtableBody = {
            records: [
                {
                    fields: {
                        ...validation.data,
                        company_id: payload.company_id // Ensure it's passed at the top level of fields
                    }
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
