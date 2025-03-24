import { useState } from "react"

export default function
CreateMeal() {
    const [formData, setFormData] = useState({
        type: "rent",
        name:"",
        description:"",
        calories:""
    });
    const { type, name, description, calories } = formData;
    function onChange() {}
    return(
        <main className="max-w-md px-2 mx-auto">
            <h1 className="text-3xl text-center mt-6 font-bold">Creat a recipe</h1>
            <form> 

                {/*We can make this page become where we deicde how i*/}

                <p className="text-lg mt-6 font-semibold">Sell / Rent</p>
                <div className="flex">
                    <button type="button" 
                    id="type" 
                    value="sale"

                    /*Change color to green or black*/

                    onClick={onChange} 
                    className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded
                    hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
                        type === "rent" ? "bg-white text-black": "bg-slate-600 text-white"
                    }`}>
                        sell

                    </button>
                    <button type="button" 
                    id="type" 
                    value="sale"
                    onclick={onChange}                    /*Change color to green or black*/
                    className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded
                    hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
                        type === "rent" ? "bg-white text-black": "bg-slate-600 text-white"
                    }`}>
                        rent

                    </button>
                </div>
                <p className="text-lg mt-6 font-semibold">Name</p>
                <input type="text" id="name" value={name} 
                onChange={onChange} 
                placeholder="Name" 
                maxLength="32" 
                min="2"
                required 
                className="w-full px-4 py-2 text-xl text-gray-700 bg-white
                border border-gray-300 rounded transition duration-150 ease-in-out 
                focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6"
                />
                <p className="text-lg mt-6 font-semibold">Description</p>
                <textarea type="text" 
                id="Description" 
                value={description} 
                onChange={onChange} 
                placeholder="Description" 
                maxLength="32" 
                min="2"
                required 
                className="w-full px-4 py-2 text-xl text-gray-700 bg-white
                border border-gray-300 rounded transition duration-150 ease-in-out 
                focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6"
                />
                <div className="">
                    <div className="">
                        <p className="text-lg font-semibold ">Calories</p>
                        <div className=""> 
                            <input 
                            type="number" 
                            id="calories" 
                            value={calories} onChnage={onChange} min="5" max="99999" required className="w-full px-4 py-2
                            text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150
                            ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center"/>
                        </div>
                    </div>
                </div>
                <div className="mb-6 ">
                    <p className="text-lg font-semi-bold ">Images</p>
                    <p className="text-gray-600">The first image will be the cover</p>
                    <input type="file" id="images" onChange={onChange}
                    accept=".jpg,.png,.jpeg"
                    multiple
                    required
                    className="w-full px-3 py-1.5 text-gray-700 bg-white border border-gray-300
                    rounded transition duration-150 ease-in-out focus:bg-white focus:border-slate-600"
                    />
                </div>
                <button type="submit" className="mb-6 w-full px-7 py-3 bg-blue-600 text-white font-medium text-sm uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"> Create Meal</button>
            </form>
        </main>
    );
}