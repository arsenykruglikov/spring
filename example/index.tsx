// import 'react-app-polyfill/ie11';
// import * as React from 'react';
// import * as ReactDOM from 'react-dom';
import Spring from '../.';

// const App = () => {
//   return <div>lol</div>;
// };

// ReactDOM.render(<App />, document.getElementById('root'));

Object.assign(window, { kek: new Spring(({ x }) => console.log(x), { maxVelocity: 1000, stiffness: 500 }) });
