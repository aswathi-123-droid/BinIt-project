import logger from "../../config/logger.js";
import {
  createCategory,
  createCategoryOffer,
  getAllCategories,
  updateCategory,
  updateCategoryOffer,
  updateCategoryStatus,
} from "../../services/admin/categoryService.js";
import { AppError, sendResponse } from "../../utils/appError.js";
import { uploadToCloudinary } from "../../utils/cloudinary.js";
import { STATUS_CODES } from "../../utils/constants.js";

export const getAllCategoriesContoller = async (req, res) => {
  const result = await getAllCategories(req.query);
  sendResponse(res, result, STATUS_CODES.OK);
};

export const createCategoryController = async (req, res) => {
  logger.info(
    `Controller: Received request to create category by Admin [${req.admin?._id}]`,
  );

  const file = req.file;
  let imageUrl = "";

  if (file) {
    imageUrl = await uploadToCloudinary(file.path);
  } else if (req.body.image) {
    imageUrl = req.body.image;
  }

  const categoryData = {
    ...req.body,
    image: imageUrl,
  };

  const newCategory = await createCategory(categoryData);

  sendResponse(
    res,
    { message: "Category created successfully", data: newCategory },
    STATUS_CODES.CREATED,
  );
};

export const updateCategoryController = async (req, res) => {
  const { categoryId } = req.params;

  logger.info(
    `Controller: Received request to update category [ID: ${categoryId}] by Admin [${req.user?._id}]`,
  );

  const file = req.file;
  let imageUrl;

  if (file) {
    logger.info(
      `Controller: Processing new image upload for category [${categoryId}]`,
    );
    imageUrl = await uploadToCloudinary(file.path);
  } else if (req.body.image) {
    imageUrl = req.body.image;
  }

  const categoryData = {
    ...req.body,
    ...(imageUrl && { image: imageUrl }),
  };

  const updatedCategory = await updateCategory(categoryId, categoryData);

  logger.info(`Controller: Category [${categoryId}] updated successfully`);

  sendResponse(
    res,
    { message: "Category updated successfully", data: updatedCategory },
    STATUS_CODES.OK,
  );
};

export const updateCategoryStatusController = async (req, res) => {
  const categoryId = req.params.categoryId;
  logger.info(
    `Controller: Toggling status for category [${categoryId}] by Admin [${req.user?._id}]`,
  );
  const updatedCategory = await updateCategoryStatus(categoryId);
  logger.info(
    `Controller: Category '${updatedCategory.name}' is now [${updatedCategory.isActive ? "ACTIVE" : "INACTIVE"}]`,
  );
  sendResponse(
    res,
    {
      message: `Category ${updatedCategory.isActive ? "activated" : "deactivated"} successfully`,
      data: updatedCategory,
    },
    STATUS_CODES.OK,
  );
};

export const createCategoryOfferController = async (req, res) => {
  const { categoryId } = req.params;
  const offerData = req.body;

  logger.info(
    `Controller: Request to create offer for category [${categoryId}] by Admin [${req.user?._id}]`,
  );

  const createdCategory = await createCategoryOffer(categoryId, offerData);

  sendResponse(
    res,
    {
      message: "Category offer created successfully",
      data: createdCategory,
    },
    STATUS_CODES.OK,
  );
};

export const updateCategoryOfferController = async (req, res) => {
  const { categoryId } = req.params;
  const offerData = req.body;

  logger.info(
    `Controller: Request to update offer for category [${categoryId}] by Admin [${req.user?._id}]`,
  );

  const updatedCategory = await updateCategoryOffer(categoryId, offerData);

  sendResponse(
    res,
    {
      message: "Category offer updated successfully",
      data: updatedCategory,
    },
    STATUS_CODES.OK,
  );
};
