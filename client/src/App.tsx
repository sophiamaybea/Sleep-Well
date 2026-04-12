import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import LoadingScreen from './LoadingScreen';
import Home from './Home';

const App = () => {
  return (
    <Router>
      <Suspense fallback={<LoadingScreen />}>  
        <Route path="*" component={Home} />
      </Suspense>
    </Router>
  );
};

export default App;