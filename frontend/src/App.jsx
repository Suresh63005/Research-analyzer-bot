import { useState } from 'react'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import Page from './Page'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <BrowserRouter>
        <Routes>
          <Route path='/' element={<Page />}></Route>
        </Routes>
     </BrowserRouter>

    </>
  )
}

export default App
