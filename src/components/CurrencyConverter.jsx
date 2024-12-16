import {useState, useEffect} from 'react';
import CurrencyDropdown from './CurrencyDropdown';


const CurrencyConverter = () => {
    const[currencies, setCurrencies]= useState([]);
    const[amount, setAmount] = useState(1);
    // const[fromCurrency, setFromCurrency]= useState('USD');
    // const[toCurrency, settoCurrency] = useState('INR')

    // const fetchCurrencies = async()=>{
        //     try{
            //         const res = await fetch(currencyApi);
            //         const data= await res.json()
            
            //         setCurrencies(object.keys(data))
            
            //     }catch(error){
                //         console.error('Error fetching', error);
                
                //     }
                // }
    const currencyApi = "https://api.frankfurter.dev"
    useEffect(()=>{
        fetch(currencyApi).then((res) => {res.json}).then((data) => {console.log(data)})

    },[])
    // console.log(currencies);

    //currencies = 'https://api.frankfurter.app/latest?amount=1&from=USD&to=INR';

  return (
    <div className="max-w-xl mx-auto my-10 p-5 bg-white rounded-lg shadow-md">
        <h2 className="mb-5 text-2xl font-semibold text-gray-700">Currency converter</h2>
        <div>
            <CurrencyDropdown currencies={currencies} title='From:'/>
            {/* swap currrecy button */}
            <CurrencyDropdown currencies={currencies} title='To :'/>
        </div>

        <div mt-4>
            <label htmlFor="amount" className='block text-sm font-medium text-gray-700'>Amount</label>
            <input type="number"  value={amount}className='w-full p-2 border-gray-300 rounded-md shadow-sm focus:outline-none  focus:ring-2 focus:ring-indigo-500 mt-1' onChange={(e)=>setAmount(e.target.value)}/>
        </div>
        <div className="flex justify-end mt-6 ">
            <button className ="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Convert</button>
        </div>
        <div className="mt-2 text-lg font-medium text-right text-green-600">Converted Amount: 69 USD</div>
    </div>
  )
}

export default CurrencyConverter