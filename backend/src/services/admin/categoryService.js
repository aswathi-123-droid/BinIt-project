import logger from "../../config/logger.js";
import Category from "../../models/category.model.js";
import { AppError, buildCategoryQuery, getCategorySortOption, getPagination } from "../../utils/appError.js";
import { STATUS_CODES } from "../../utils/constants.js";


export const createCategory = async(categoryData) => {
    const {name, type, offer} = categoryData;

    logger.info(`Admin initiating create category: ${name} [Type: ${type}]`);

    const existingCategory = await Category.findOne({
        name: {$regex: new RegExp(`^${name}$`,"i")}
    })

    if(existingCategory){
        logger.warn(`Create category failed: Duplicate name '${name}' detected.`);

        throw new AppError(
            STATUS_CODES.CONFLICT,
            "CONFLICT",
            `Category with the name '${name}' already exists.`
        )
    };

    let finalData = {
        name,
        type,
        description: categoryData.description || "",
        image: categoryData.image || "",
    };

    if(offer){
        finalData.offer = {
            isActive: offer.isActive || false,
            title: offer.title,
            description: offer.description,
            discountType: offer.discountType,
            value: offer.value,
            maxRedeemablePrice: offer.maxRedeemablePrice || null,
            minTransactionalValue: offer.minTransactionalValue || 0,
            startDate: offer.startDate,
            expiryDate: offer.expiryDate,
        }
    }

    const newCategory = await Category.create(finalData)

    logger.info(`Category created successfully: ${newCategory.name} [ID: ${newCategory._id}]`);

    return newCategory;
}

export const updateCategory = async (categoryId, updateData) => {
    const { name, type, offer, description, image, isActive } = updateData;

    logger.info(`Admin initiating update for category ID: ${categoryId}`);

    // 1. Check if the category exists
    const category = await Category.findById(categoryId);
    if (!category) {
        throw new AppError(
            STATUS_CODES.NOT_FOUND,
            "NOT_FOUND",
            "The category with the specified ID could not be found."
        );
    }

    // 2. Check for duplicate name (only if name is changing)
    if (name && name.trim().toLowerCase() !== category.name.toLowerCase()) {
        const existingCategory = await Category.findOne({
            name: { $regex: new RegExp(`^${name}$`, "i") },
            _id: { $ne: categoryId } // Exclude the current category from check
        });

        if (existingCategory) {
            logger.warn(`Update failed: Duplicate name '${name}' detected.`);
            throw new AppError(
                STATUS_CODES.CONFLICT,
                "CONFLICT",
                `Category with the name '${name}' already exists.`
            );
        }
    }

    // 3. Construct the update object
    let finalData = {
        ...(name && { name }),
        ...(type && { type }),
        ...(description && { description }),
        ...(image && { image }), // Assumes controller handles file upload and passes URL
        ...(isActive !== undefined && { isActive }),
    };

    // 4. Handle Nested Offer Updates
    // We merge existing offer data with new data to prevent overwriting fields with undefined
    if (offer) {
        finalData.offer = {
            isActive: offer.isActive !== undefined ? offer.isActive : category.offer?.isActive,
            title: offer.title || category.offer?.title,
            description: offer.description || category.offer?.description,
            discountType: offer.discountType || category.offer?.discountType,
            value: offer.value || category.offer?.value,
            maxRedeemablePrice: offer.maxRedeemablePrice !== undefined ? offer.maxRedeemablePrice : category.offer?.maxRedeemablePrice,
            minTransactionalValue: offer.minTransactionalValue !== undefined ? offer.minTransactionalValue : category.offer?.minTransactionalValue,
            startDate: offer.startDate || category.offer?.startDate,
            expiryDate: offer.expiryDate || category.offer?.expiryDate,
        };
    }

    // 5. Perform the Update
    const updatedCategory = await Category.findByIdAndUpdate(
        categoryId,
        finalData,
        { new: true, runValidators: true }
    );

    logger.info(`Category updated successfully: ${updatedCategory.name}`);

    return updatedCategory;
};

export const getAllCategories = async(queryParams) => {
  const { 
    page, 
    limit,
    status, 
    type, 
    search, 
    sortBy = "newest", 
  } = queryParams;

  const query = buildCategoryQuery({status,search,type})

  const {pageSize,skip,pageNumber} = getPagination(page,limit);
  
  const sort = getCategorySortOption(sortBy);

  const [categories, totalCount, recyclableCount, junkCount, storeCount] = await Promise.all([
    Category.find(query)
      .sort(sort)
      .skip(skip)
      .limit(pageSize),
    Category.countDocuments({ isDeleted: false }),
    Category.countDocuments({ type: "recyclable", isDeleted: false }),
    Category.countDocuments({ type: "junk", isDeleted: false }),
    Category.countDocuments({ type: "store", isDeleted: false }),
  ]);

  return {
    categories,
    stats:{
      totalCount,
      recyclableCount,
      junkCount,
      storeCount
    },
    pagination:{
      totalCount,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCount / pageSize),
      pageSize,
    }
  }
}

export const updateCategoryStatus = async (categoryId) => {
  
  logger.info(`Service: Toggling status for category [ID: ${categoryId}]`);

  const category = await Category.findById(categoryId);

  if (!category) {
    logger.warn(`Toggle failed: Category not found [ID: ${categoryId}]`);
    
    throw new AppError(
      STATUS_CODES.NOT_FOUND,
      "CATEGORY_NOT_FOUND",
      "The category with the specified ID could not be found."
    );
  }

  const oldStatus = category.isActive;
  category.isActive = !category.isActive;

  await category.save();

  logger.info(
    `Category status updated: ${category.name} [ID: ${categoryId}] changed from ${oldStatus} to ${category.isActive}`
  );

  return category;
};

export const createCategoryOffer = async (categoryId, offerData) => {
    const { 
        title, 
        description, 
        discountType, 
        value, 
        minTransactionalValue, 
        maxRedeemablePrice, 
        startDate, 
        expiryDate, 
        isActive 
    } = offerData;

    // 1. Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
        throw new AppError(
            STATUS_CODES.NOT_FOUND,
            "NOT_FOUND",
            "Category not found"
        );
    }

    // 2. Validate Dates (Basic check)
    const start = new Date(startDate);
    const expiry = new Date(expiryDate);
    if (start >= expiry) {
        throw new AppError(
            STATUS_CODES.BAD_REQUEST,
            "INVALID_DATE",
            "Expiry date must be after the start date"
        );
    }

    // 3. Construct the Offer Object
    // We explicitly set fields to ensure clean data
    const newOffer = {
        title,
        description: description || "",
        discountType,
        value,
        minTransactionalValue: minTransactionalValue || 0,
        maxRedeemablePrice: maxRedeemablePrice || null,
        startDate: start,
        expiryDate: expiry,
        isActive: isActive !== undefined ? isActive : true
    };

    // 4. Update the Category
    category.offer = newOffer;
    await category.save();

    logger.info(`Offer created for category: ${category.name} [Offer: ${title}]`);

    return category;
};

export const updateCategoryOffer = async(categoryId, offerData) => {
  const category = await Category.findById(categoryId);

    if (!category) {
        logger.warn(`Service: Update offer failed. Category not found [ID: ${categoryId}]`);
        throw new AppError(
            STATUS_CODES.NOT_FOUND,
            "CATEGORY_NOT_FOUND",
            "The category with the specified ID could not be found."
        );
    }

    // 2. Overwrite the offer field with new data
    // We merge with existing offer data to be safe, or replace entirely.
    // Since your frontend sends the full object, direct replacement is usually fine.
    category.offer = {
        isActive: offerData.isActive !== undefined ? offerData.isActive : true,
        title: offerData.title,
        description: offerData.description || "",
        discountType: offerData.discountType,
        value: offerData.value,
        minTransactionalValue: offerData.minTransactionalValue || 0,
        maxRedeemableAmount: offerData.maxRedeemablePrice || 0, // Note: Frontend calls it maxRedeemablePrice, Schema calls it minRedeemableAmount (check naming consistency!)
        startDate: offerData.startDate,
        expiryDate: offerData.expiryDate
    };

    // 3. Save
    const updatedCategory = await category.save();
    
    logger.info(`Service: Offer updated successfully for category '${category.name}'`);
    
    return updatedCategory;
}

