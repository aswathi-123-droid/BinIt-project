import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { getProfile } from "../../account/authSlice";
import {
  User,
  Mail,
  Edit2,
  Camera,
  Info,
  Copy,
  CheckCircle2,
} from "lucide-react";
import OtpVerifyModal from "./VerifyOtpModal";
import { api } from "../../../../api/axiosInstance";
import toast from "react-hot-toast";
import { useRef } from "react";

const MyProfile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [emailTrigger, setEmailTrigger] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [otpModal, setOtpModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  console.log(user);
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, dirtyFields },
    reset,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
    },
  });

  useEffect(() => {
    if (user) {
      console.log("Hiii");
      reset({
        name: user.name,
        email: user.email,
      });
    }
  }, [user, reset]);

  const handleEmailTrigger = () => {
    console.log("Hiiiix");
    setEmailTrigger(!emailTrigger);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validImageTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload a JPEG, PNG, or WEBP image.');
      e.target.value = null; 
      return;
    }
    if (file) {
      setProfilePic(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const onClose = () => {
    setOtpModal(false);
  };
  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);

      if (dirtyFields.email) {
        formData.append("email", data.email);
      }

      if (profilePic) {
        formData.append("profileImage", profilePic);
      }

      if (dirtyFields.email) {
        setOtpModal(true);
        setNewEmail(data.email);
        const res = await api.patch("/account/update-details", formData);
        toast.success("Profile updated successfully");
      } else {
        setLoading(true);
        const res = await api.patch("/account/update-details", formData);
        toast.success("Profile updated successfully");
        setLoading(false);
        dispatch(getProfile()).unwrap();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
      setOtpModal(false);
    }
  };

  const handleCopyReferral = () => {
    if (!user.referralCode) {
      toast.error("Referral code not generated yet!");
      return;
    }
    navigator.clipboard.writeText(user.referralCode);
    setCopied(true);
    toast.success("Referral code copied to clipboard!");

    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 bg-white min-h-screen p-4 sm:p-8 font-sans flex justify-center">
      <div className="">
        <div className="mb-8  ">
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="max-w-3xl min-w-4xl bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="h-32 bg-emerald-50/60 w-full"></div>

          <div className="relative px-8 pb-6 flex flex-col items-center -mt-16">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center text-3xl font-bold text-gray-400 overflow-hidden">
                {previewUrl ||
                (user.avatar && user.avatar.startsWith("http")) ? (
                  <img
                    src={previewUrl || user.avatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                )}
              </div>

              <button
                type="button"
                onClick={triggerFileInput}
                className="absolute bottom-0 right-0 p-2 bg-emerald-500 rounded-full text-white hover:bg-emerald-600 transition-colors shadow-md"
              >
                <Camera size={16} />
              </button>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg, image/png, image/webp"
                style={{ display: "none" }}
                onChange={handleImageSelect}
              />
            </div>

            <h2 className="text-xl font-bold text-slate-900 mt-4">
              {user.name}
            </h2>
          </div>

          <div className="px-8 py-6 border-t border-gray-50">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...register("name", { required: "Name is required" })}
                    className={`w-full pl-12 pr-12 py-3 bg-gray-50/50 border rounded-xl text-sm font-semibold transition-all ${
                      errors.name
                        ? "border-red-500"
                        : "border-gray-200 focus:border-emerald-500"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Email Address
                </label>
                <div className="flex gap-3">
                  <input
                    type="email"
                    {...register("email")}
                    className={`grow pl-12 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-semibold ${emailTrigger ? "text-slate-900" : "cursor-not-allowed text-gray-400 "}`}
                  />
                  <button
                    onClick={handleEmailTrigger}
                    type="button"
                    className={`px-6 py-3 border border-gray-200 rounded-xl text-sm font-bold flex items-center gap-2 ${emailTrigger ? " bg-emerald-500  hover:bg-emerald-600 text-white" : " hover:bg-gray-50"}`}
                  >
                    {emailTrigger ? "" : <Edit2 size={16} />}
                    {emailTrigger ? "Cancel" : " Change Email"}
                  </button>
                </div>
              </div>

              <div className="bg-emerald-50/50 rounded-xl p-5 flex items-center justify-between border border-emerald-100/50">
                <p className=" text-l font-bold">
                  Your Referral Code:{" "}
                  <span className="text-emerald-600 ml-2 ">
                    {user.referralCode}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={handleCopyReferral}
                  className={`transition-all ${copied ? "text-emerald-500" : "text-gray-400 hover:text-emerald-500"}`}
                >
                  {" "}
                  {copied ? <CheckCircle2 size={20} /> : <Copy size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end items-center gap-4 mt-10">
              <button
                type="button"
                onClick={() => reset()}
                className="text-sm font-bold text-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={(!isDirty && !profilePic) || loading}
                className={`px-8 py-3 text-white text-sm font-bold rounded-xl shadow-md ${
                  (isDirty || profilePic) && !loading
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : "bg-gray-300"
                }`}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <OtpVerifyModal
        isOpen={otpModal}
        onClose={onClose}
        email={newEmail}
      ></OtpVerifyModal>
    </div>
  );
};

export default MyProfile;
