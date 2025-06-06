import { Quote } from "../components/Quotes"
import { Auth } from "../components/Auth"

export const Signin = () => {
  return (
    <div>
      <div className="grid grid-cols-2">
        <div>
          <Auth type="signin" />
        </div>
        <div className="hidden lg:block">
          <Quote />
        </div>
      </div>
    </div>
  )

}   
export default Signin