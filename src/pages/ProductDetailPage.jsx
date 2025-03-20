
import axios from "axios";
import { useState,useEffect } from "react";
import { useParams } from 'react-router-dom';
import ReactLoading from 'react-loading';


const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

export default function ProductDetailPage() {

  const [product, setProduct] = useState({});
  const [qtySelect,setQtySelect] = useState(1);
  const [isLoading, setIsLoading] = useState(false);//(部分)預設關閉
  const [isScreenLoading, setIsScreenLoading] = useState(false);//(全螢幕)預設關閉

  //將產品id解構出來，對應到路由設置是'products/:id'，已將product_id命名為id，所以要寫成{id : product_id}
  const {id : product_id} = useParams()

    //取得產品列表
    useEffect(() => {
      const getProduct = async () => {
        //在發送get請求前，開啟Loading
        setIsScreenLoading(true);
        try {
          const res = await axios.get(`${BASE_URL}/v2/api/${API_PATH}/product/${product_id}`);
          setProduct(res.data.product);
        } catch (error) {
          alert("取得產品失敗");
        }
        finally{
          //無論成功或失敗，都要關閉Loading
          setIsScreenLoading(false);
        }
      };
      getProduct();
     
    }, []);

     //加入購物車：數量要轉型別
     const addCartItem = async(product_id,qty)=>{
      setIsLoading(true);//跑Loading
      try {
        await axios.post(`${BASE_URL}/v2/api/${API_PATH}/cart`,{
          data:{
            product_id,
            qty:Number(qty)
          }
        })
       
      } catch (error) {
      alert("加入購物車失敗")
      }
      finally{
        //最後關閉Loading
        setIsLoading(false);
      }
    }

  return (
    <>
    <div className="container mt-5">
      <div className="row">
        <div className="col-6">
          <img className="img-fluid" src={product.imageUrl} alt={product.title} />
        </div>
        <div className="col-6">
          <div className="d-flex align-items-center gap-2">
            <h2>{product.title}</h2>
            <span className="badge text-bg-success">{product.category}</span>
          </div>
          <p className="mb-3">{product.description}</p>
          <p className="mb-3">{product.content}</p>
          <h5 className="mb-3">NT$ {product.price}</h5>
          <div className="input-group align-items-center w-75">
            <select
              value={qtySelect}
              onChange={(e) => setQtySelect(e.target.value)}
              id="qtySelect"
              className="form-select"
            >
              {Array.from({ length: 10 }).map((_, index) => (
                <option key={index} value={index + 1}>
                  {index + 1}
                </option>
              ))}
            </select>
            <button onClick={()=>addCartItem(product_id,qtySelect)} type="button" className=" btn btn-primary d-flex align-items-center gap-2" disabled = {isLoading}>
              加入購物車
              {isLoading &&(
                <ReactLoading
                type={"spin"}
                color={"#000"}
                height={"1.5rem"}
                width={"1.5rem"}
              />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
     {/* Loading ：當isScreenLoading 開的時候才顯示*/}
          {isScreenLoading &&(
            <div
            className="d-flex justify-content-center align-items-center"
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(255,255,255,0.3)",
              zIndex: 999,
            }}
          >
            <ReactLoading type="spin" color="black" width="4rem" height="4rem" />
          </div>
          )}
    </>
    

  )
}