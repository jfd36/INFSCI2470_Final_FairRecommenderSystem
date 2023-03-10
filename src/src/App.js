import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import Explorer from './components/Explorer';
import './App.css';

const Container = styled.div.attrs({
  className: 'container'
})`
  width: 80%;
  margin: 10px auto;
  // -- example --
  // display: grid;
  // grid-template-rows: 50px 900px 450px;
  // grid-template-columns: 15% 85%;
  // grid-template-areas:
  //  'e e'

  font-size: 0.9rem;
  font-family: sans-serif;
  color: #404040;
`;

function App() {

  const [interactions, setInteractions] = useState([
    { 'userID': 1, 'itemID': 1, 'score': 1 },
    { 'userID': 1, 'itemID': 2, 'score': 1 },
    { 'userID': 2, 'itemID': 3, 'score': 1 },
  ]);

  useEffect(() => {
    // fetch function for loading data from API
  }, []);

  return (
    <Container>
      <header>
      </header>
      <Explorer 
          interactions={interactions}
      />
    </Container>
  );
}

export default App;
