import logo from './logo.svg';
import './App.css';
import DataGrid from 'react-data-grid';
import 'react-data-grid/dist/react-data-grid.css';

import bus from './bus.js';
bus.initialize();

let columns=[
    {key: 'month', name: 'Month'},
    {key: 'acme_boxes', name: 'Acme Boxes'},
    {key: 'acme_staples', name: 'Acme Staples'}
]; 

let rows=[
    { month: '2020-07', acme_boxes: 50, acme_staples: 60 },
    { month: '2020-08', acme_boxes: 60, acme_staples: 80 },
    { month: '2020-09', acme_boxes: 70, acme_staples: 50 },
    { month: '2020-11', acme_boxes: 80, acme_staples: 100 }
];


function App() {
  return (
     <DataGrid
      columns={columns}
      rows={rows}
    />
  );
}

export default App;
