import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Modal } from "bootstrap";
import ReactLoading from 'react-loading';


const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;


function App() {
  const [products, setProducts] = useState([]);
  const [tempProduct, setTempProduct] = useState([]);
  const [cart, setCart] = useState({});
  const [isScreenLoading, setIsScreenLoading] = useState(false);//(全螢幕)預設關閉
  const [isLoading, setIsLoading] = useState(false);//(部分)預設關閉
  
  //取得購物車列表
  const getCart = async()=>{
    try {
      const res = await axios.get(`${BASE_URL}/v2/api/${API_PATH}/cart`)
      //第一個data是axios的data，第二個data是購物車回傳的data(六角API格式))
      setCart(res.data.data)

    } catch (error) {
      alert("取得購物車列表失敗")
    }
  }

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
    getCart();
  }, []);

  const productModalRef = useRef(null);
  useEffect(() => {
    new Modal(productModalRef.current, { backdrop: false });
  }, []);

  const openModal = () => {
    const modalInstance = Modal.getInstance(productModalRef.current);
    modalInstance.show();
  };

  const closeModal = () => {
    const modalInstance = Modal.getInstance(productModalRef.current);
    modalInstance.hide();
  };

  const handleSeeMore = (product) => {
    setTempProduct(product);
    openModal();
  };

  const [qtySelect, setQtySelect] = useState(1);
  
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
     getCart();//每次加入購物車後重新取得列表
    } catch (error) {
    alert("加入購物車失敗")
    }
    finally{
      //最後關閉Loading
      setIsLoading(false);
    }
  }

  //清空購物車(全部)
  const removeCart = async()=>{
    setIsScreenLoading(true);
    try {
      await axios.delete(`${BASE_URL}/v2/api/${API_PATH}/carts`)
     getCart();//每次加入購物車後重新取得列表
    } catch (error) {
    alert("清空購物車失敗")
    }
    finally{
      //最後關閉Loading
      setIsScreenLoading(false);
    }
  }

   //刪除購物車(單一)
   const removeCartItem = async(cartItem_id)=>{
    setIsScreenLoading(true);
    try {
      await axios.delete(`${BASE_URL}/v2/api/${API_PATH}/cart/${cartItem_id}`)
     getCart();//每次加入購物車後重新取得列表
    } catch (error) {
    alert("刪除購物車品項失敗")
    }
    finally{
      //最後關閉Loading
      setIsScreenLoading(false);
    }
  }

  //調整購物車產品數量 (六角API參數有三個，所以都代進去)
  const updateCartItem = async(cartItem_id,product_id,qty)=>{
    setIsScreenLoading(true);
    try {
      await axios.put(`${BASE_URL}/v2/api/${API_PATH}/cart/${cartItem_id}`,{
        data:{
          product_id,
          qty:Number(qty)
        }
      })
     getCart();//每次加入購物車後重新取得列表
    } catch (error) {
    alert("更新購物車品項失敗")
    }
    finally{
      //最後關閉Loading
      setIsScreenLoading(false);
    }
  }

  //結帳表單：1.errors預設為空物件，若有error發生，物件會有資料，2.reset是清空表單資料
  const{
    register,
    handleSubmit,
    formState:{errors},
    reset
  } = useForm()

  const onSubmit = handleSubmit((data)=>{
    console.log(data)
    //使用解構的方式將送出後回傳的資料改成六角API格式
    const{message,...user} = data;
      
    //AI建議：確保購物車內有品項才發post請求，否則出現提示
    if (!cart.carts || cart.carts.length === 0) {
      alert("購物車內沒有商品，請添加商品後再結帳！");
      return;
    }

    const userInfo={
      data:{
        user,
      message
      }
    }
    checkout(userInfo);
  })

  //結帳(訂單提交)API
  const checkout = async(data)=>{
    setIsScreenLoading(true);
    try {
      await axios.post(`${BASE_URL}/v2/api/${API_PATH}/order`,data)   
      reset();//送出後清空表單
      getCart();//重新取得購物車列表(重新渲染後會清空)
      alert("結帳成功！");
    } catch (error) {
      alert("結帳失敗")
    }
    finally{
      //最後關閉Loading
      setIsScreenLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="mt-4">
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
                    <button
                      onClick={() => handleSeeMore(product)}
                      type="button"
                      className="btn btn-outline-secondary"
                    >
                      查看更多
                    </button>
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

        <div
          ref={productModalRef}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          className="modal fade"
          id="productModal"
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h2 className="modal-title fs-5">
                  產品名稱：{tempProduct.title}
                </h2>
                <button
                  onClick={closeModal}
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <img
                  src={tempProduct.imageUrl}
                  alt={tempProduct.title}
                  className="img-fluid"
                />
                <p>內容：{tempProduct.content}</p>
                <p>描述：{tempProduct.description}</p>
                <p>
                  價錢：{tempProduct.price}{" "}
                  <del>{tempProduct.origin_price}</del> 元
                </p>
                <div className="input-group align-items-center">
                  <label htmlFor="qtySelect">數量：</label>
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
                </div>
              </div>
              <div className="modal-footer">
                {/*1.透過點擊tempProductModal把tempProduc把加進去，所以取其id
                2.當isLoadin為true時，加入購物車的按鈕為disabled，api回傳後才能再點擊，避免api尚未回傳就重複點擊 */}
                <button disabled = {isLoading} onClick={()=> addCartItem (tempProduct.id,qtySelect)} type="button" className="btn btn-primary d-flex align-items-center gap-2">
                <div>加入購物車</div>
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
       
        {/* 若購物車長度大於0，則顯示以下資料*/}
        {cart.carts?.length > 0 && (
          <div>
            <div className="text-end py-3">
              <button onClick={removeCart} className="btn btn-outline-danger" type="button">
                清空購物車
              </button>
            </div>

            <table className="table align-middle">
              <thead>
                <tr>
                  <th></th>
                  <th>品名</th>
                  <th style={{ width: "150px" }}>數量/單位</th>
                  <th className="text-end">單價</th>
                </tr>
              </thead>

              <tbody>
                {/* */}
                {cart.carts?.map((cartItem) => (
                <tr key={cartItem.id}>
                  <td>
                    <button onClick={()=>removeCartItem(cartItem.id)} type="button" className="btn btn-outline-danger btn-sm">
                      x
                    </button>
                  </td>
                  <td>{cartItem.product.title}</td>
                  <td style={{ width: "150px" }}>
                    <div className="d-flex align-items-center">
                      <div className="btn-group me-2" role="group">
                        <button
                        onClick={()=>updateCartItem(cartItem.id,cartItem.product.id,cartItem.qty-1)}
                       //若數量為1，則disabled，才不會出現按下減鈕時數量為0
                        disabled={cartItem.qty === 1}
                          type="button"
                          className="btn btn-outline-dark btn-sm"
                        >
                          -
                        </button>
                        <span
                          className="btn border border-dark"
                          style={{ width: "50px", cursor: "auto" }}
                        >{cartItem.qty}</span>
                        <button
                        onClick={()=>updateCartItem(cartItem.id,cartItem.product.id,cartItem.qty+1)}
                          type="button"
                          className="btn btn-outline-dark btn-sm"
                        >
                          +
                        </button>
                      </div>
                      <span className="input-group-text bg-transparent border-0">
                      {cartItem.product.unit}
                      </span>
                    </div>
                  </td>
                  <td className="text-end">{cartItem.total}</td>
                </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="text-end">
                    總計：
                  </td>
                  <td className="text-end" style={{ width: "130px" }}>{cart.total}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* 結帳表單 */}
      <div className="my-5 row justify-content-center">
        <form onSubmit={onSubmit} className="col-md-6">
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
            //requierd可接訊息或布林值，value接的是Email 驗證
            {...register("email", {
              required : "Email欄位必填",
              pattern:{
                value:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message:"Email格式錯誤"}
            })}

              id="email"
              type="email"
              //當 errors.email 存在 → className 為 "form-control is-invalid"
              //當 errors.email 不存在 → className 為 "form-control"
              //等於：className={`form-control ${errors.email && "is-invalid"}`}
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              placeholder="請輸入 Email"
            />

            {/* 錯誤時才跳出題提示 */}
            {errors.email && <p className="text-danger my-2">{errors.email.message}</p>}
          </div>

          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              收件人姓名
            </label>
            <input
            {...register("name", {
              required : "姓名欄位必填",
            })}
            
              id="name"
              className={`form-control ${errors.name ? "is-invalid" : ""}`}
              placeholder="請輸入姓名"
            />

            {errors.name && <p className="text-danger my-2">{errors.name.message}</p>}
          </div>

          <div className="mb-3">
            <label htmlFor="tel" className="form-label">
              收件人電話
            </label>
            <input
            {...register("tel", {
              required : "電話欄位必填",
              pattern:{
                value:/^(0[2-8]\d{7}|09\d{8})$/,
                message:"電話格式錯誤"}
            })}
              id="tel"
              type="text"
              className={`form-control ${errors.tel ? "is-invalid" : ""}`}
              placeholder="請輸入電話"
            />

            {errors.tel && <p className="text-danger my-2">{errors.tel.message}</p>}      
          </div>

          <div className="mb-3">
            <label htmlFor="address" className="form-label">
              收件人地址
            </label>
            <input
            {...register("address", {
              required : "地址欄位必填",
            })}
              id="address"
              type="text"
              className={`form-control ${errors.address ? "is-invalid" : ""}`}
              placeholder="請輸入地址"
            />

            {errors.address && <p className="text-danger my-2">{errors.address.message}</p>}
          </div>

          <div className="mb-3">
            <label htmlFor="message" className="form-label">
              留言
            </label>
            <textarea
            {...register("message")}
              id="message"
              className="form-control"
              cols="30"
              rows="10"
            ></textarea>
          </div>
          <div className="text-end">
            <button type="submit" className="btn btn-danger">
              送出訂單
            </button>
          </div>
        </form>
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
      
    </div>
  );
}

export default App;
