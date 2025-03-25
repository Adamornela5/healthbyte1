import { Link } from "react-router-dom";
import moment from "moment";
import { FaTrash } from "react-icons/fa";
import { MdEdit } from "react-icons/md";

export default function ListingItem({listing, id, onEdit, onDelete}) {
  return (
    <li className="relative bg-white flex flex-col justify-between items-center shadow-md hover:shadow-xl rounded-md overflow-hidden transition-shadow duration-150 m-[10px]">
        <Link className="contents" to ={`/category/${listing.type}/${id}`}>
            <img className="h-[170px] w-full object-cover hover:scale-105 transition-scale duration-200 ease-in"
            loading="lazy"
            src={listing.imgUrls[0]} alt="" />
            <p className="absolute top-2 left-2 bg-[#3377cc] text-white uppercase text-xs font-semibold rounded-md px-2 py-1 shadow-lg">
            {moment(listing.timestamp?.toDate()).fromNow()}
            </p>
            <div className="w-full p-[10px]">
                <p className="font-semibold m-0 text-xl">{listing.name}</p>
                <p className="text-[#457b9d] mt-2 font-semibold">{listing.calories
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",") // this is to convert for example 123456 to 123,456
                    } Calories

                </p>
            </div>
        </Link>
        {onDelete && (
            <FaTrash className="absolute bottom-2 right-2 h-[14px] cursor-pointer text-red-500"
            onClick={()=>onDelete(listing.id)}
            />
            
        )}
        {onEdit && (
            <MdEdit className="absolute bottom-2 right-7 h-4 cursor-pointer"
            onClick={()=>onEdit(listing.id)}
            />
            
        )}
    </li>
  )
}
