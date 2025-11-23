// Using native fetch

async function testCodeSuggestion() {
    const url = 'http://localhost:3000/api/code-suggestion';
    const payload = {
        fileContent: 'function add(a, b) {\n  return a + b;\n}\n\n// Calculate sum',
        cursorLine: 4,
        cursorColumn: 16,
        suggestionType: 'function',
        fileName: 'test.js'
    };

    try {
        console.log('Sending request to:', url);
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        console.log('Response status:', response.status);

        if (response.ok) {
            const data = await response.json();
            console.log('Response data:', JSON.stringify(data, null, 2));
        } else {
            const text = await response.text();
            console.error('Error response:', text);
        }
    } catch (error) {
        console.error('Request failed:', error);
    }
}

testCodeSuggestion();
