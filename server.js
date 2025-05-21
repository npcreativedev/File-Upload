const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN || 'pat1LVWFOor3YSUuH';
const BASE_ID = 'app7rMRcgBcpV3mmC'; // replace if different

app.post('/update-airtable', async (req, res) => {
    const { tableId, files } = req.body;

    if (!tableId || !files || !Array.isArray(files)) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }

    let updatedCount = 0;
    let skipped = 0;
    let failed = 0;

    try {
        for (const file of files) {
            console.log(`🔍 Checking Airtable for ID="${file.id}" in table "${tableId}"`);
          
            try {
              const filterUrl = `https://api.airtable.com/v0/${BASE_ID}/${tableId}?filterByFormula=${encodeURIComponent(`VALUE({ID})=VALUE("${file.id}")`)}`;
          
              const findRes = await fetch(filterUrl, {
                headers: {
                  Authorization: `Bearer ${AIRTABLE_TOKEN}`
                }
              });
          
              const rawText = await findRes.text();
              console.log(`🧪 Airtable API raw response:\n${rawText}`);
          
              let findData;
              try {
                findData = JSON.parse(rawText);
              } catch (e) {
                console.error("❌ Failed to parse Airtable JSON:", e.message);
                failed++;
                continue;
              }
          
              if (!findData.records || findData.records.length === 0) {
                console.log(`⚠️ No record found for ID="${file.id}"`);
                skipped++;
                continue;
              }
          
              const recordId = findData.records[0].id;
              console.log(`✅ Found record ID: ${recordId}`);
          
              const patchRes = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${tableId}/${recordId}`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${AIRTABLE_TOKEN}`
                },
                body: JSON.stringify({
                  fields: {
                    'Media URLs': file.url
                  }
                })
              });
          
              if (patchRes.ok) {
                console.log(`✅ Successfully updated Airtable record ${recordId}`);
                updatedCount++;
              } else {
                const errText = await patchRes.text();
                console.error(`❌ Failed to update Airtable record ${recordId}:\n${errText}`);
                failed++;
              }
          
            } catch (err) {
              console.error(`💥 Unexpected error for file ID "${file.id}":`, err.message);
              failed++;
            }
          }
          

        return res.status(200).json({
            success: true,
            updated: updatedCount,
            skipped,
            failed
        });

    } catch (err) {
        console.error('❌ General error during update:', err);
        return res.status(500).json({ error: 'Update failed.' });

    }
});


app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
