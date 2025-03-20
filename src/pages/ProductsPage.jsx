import { useEffect, useState } from "react";
import axios from "axios";
import ReactLoading from 'react-loading';
import { Link } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;


export default function ProductsPage() {

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);//(部分)預設關閉
  const [isScreenLoading, setIsScreenLoading] = useState(false);//(全螢幕)預設關閉

    //取得產品列表
    useEffect(() => {
      const getProducts = async () => {
        //在發送get請求前，開啟Loading
        setIsScreenLoading(true);
        try {
          const res = await axios.get(`${BASE_URL}/v2/api/${API_PATH}/products`);
          setProducts(res.data.products);
        } catch (error) {
          alert("取得產品失敗");
        }
        finally{
          //無論成功或失敗，都要關閉Loading
          setIsScreenLoading(false);
        }
      };
      getProducts();
     
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
      <div className="container">
        <table className="table align-middle">
            <thead>
              <tr>
                <th>圖片</th>
                <th>商品名稱</th>
                <th>價格</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td style={{ width: "200px" }}>
                    <img
                      className="img-fluid"
                      src={product.imageUrl}
                      alt={product.title}
                    />
                  </td>
                  <td>{product.title}</td>
                  <td>
                    <del className="h6">原價 {product.origin_price} 元</del>
                    <div className="h5">特價 {product.origin_price}元</div>
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <Link
                        to={`/products/${product.id}`}
                       
                        className="btn btn-outline-secondary"
                      >
                        查看更多
                      </Link>
                      {/*透過product來渲染產品列表，所以取其id ，點擊一次數量+1，預設數量為1*/}
                      <button disabled = {isLoading} onClick={()=>addCartItem(product.id,1)} type="button" className=" btn btn-outline-danger d-flex align-items-center gap-2">
                        加到購物車
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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