import React, { useRef, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import MonacoEditor from 'react-monaco-editor';

const mongoURI = 'mongodb://0.0.0.0:27017/quote';

const recurssiveTransform = (item) => {
    const nodes = [];
    Object.keys(item).forEach(key => {
        const value = item[key];
        const node = {
            id: `${ Math.round(Math.random() * 1000000)}`,
        };
        if (value !== null && typeof value === 'object') {
            const childrenNodes = recurssiveTransform(value);
            node.label = JSON.stringify({ [`${key}`]: `{...}` });
            if (childrenNodes && childrenNodes.length > 0) {
                node.children = childrenNodes;
            }
        } else {
            node.label = JSON.stringify({ [`${key}`]: `${value}` });
        }

        nodes.push(node);
    });
    return nodes;
}

const transformDocumentsToTree = (obj) => {
    const result = Array.from(obj).map((item) => {
        if (item === null || typeof item !== 'object') {
            return null;
        }

        const nodes = recurssiveTransform(item);
        return nodes;
    });
    return result;
};

const HomePage = () => {
    const editorRef = useRef(null);
    const [documents, setDocuments] = useState([]);

    const initialQuery = ``;

    const handleEditorDidMount = (editor) => {
        editorRef.current = editor;
    };

    const handleRun = async () => {
        try {
            const connectDb = await window.electronAPI.connectDatabase(mongoURI);
            const docs = await window.electronAPI.listDocuments('quotes');
            const transformedDocs = transformDocumentsToTree(docs);
            setDocuments([...transformedDocs[0]]);
        } catch (error) {
            console.error('Error fetching documents:', error);
        }
    };

    return (
        <Box display="flex" height="100vh" overflow="hidden">
            <Box
                width="300px"
                bgcolor="#f0f0f0"
                display="flex"
                flexDirection="column"
                overflow="hidden"
            >
                <Box p={2}>
                    <Typography variant="h6">Left Column</Typography>
                </Box>
            </Box>
            <Box flex="1" display="flex" flexDirection="column" bgcolor="gray.100" overflow="hidden">
                <Box bgcolor="white" px={2} py={1}>
                    <Button variant="contained" color="warning" onClick={handleRun}>
                        Run
                    </Button>
                </Box>
                <Box flex="0 0 20%" bgcolor="white" p={2} overflow="hidden" display="flex">
                    <MonacoEditor
                        language="javascript"
                        theme="vs-dark"
                        options={{
                            selectOnLineNumbers: true,
                            minimap: { enabled: false },
                            automaticLayout: true,
                            fontSize: 14,
                            lineHeight: 1.5,
                        }}
                        value={initialQuery}
                        editorDidMount={handleEditorDidMount}
                    />
                </Box>
                <Box flex="1" p={2} overflow="auto">
                    <RichTreeView items={documents} />
                </Box>
            </Box>
        </Box>
    );
};

export default HomePage;