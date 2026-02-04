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
        isActive: categoryData.isActive
    };

    if(offer){
        finalData.offer = {
            isActive: offer.isActive || false,
            title: offer.title,
            description: offer.description,
            discountType: offer.discountType,
            value: offer.value,
            maxRedeemableAmount: offer.maxRedeemableAmount || null,
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

    const category = await Category.findById(categoryId);
    if (!category) {
        throw new AppError(
            STATUS_CODES.NOT_FOUND,
            "NOT_FOUND",
            "The category with the specified ID could not be found."
        );
    }

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

    let finalData = {
        ...(name && { name }),
        ...(type && { type }),
        ...(description && { description }),
        ...(image && { image }), 
        ...(isActive !== undefined && { isActive }),
    };

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

  const categoriesPromise = Category.aggregate([
    { $match: query },
    {
      $lookup: {
        from: 'products',          // The actual name of your collection in MongoDB
        localField: '_id',
        foreignField: 'categoryId', // The field in Product model that references Category
        as: 'products'
      }
    },
    {
      $addFields: {
        itemCount: { $size: '$products' } 
      }
    },
    { $sort: sort },   
    { $skip: skip },  
    { $limit: pageSize }, 
    { $project: { products: 0 } } // Remove the products array to keep the response light
  ]);

  const [categories, totalCount, recyclableCount, junkCount, storeCount] = await Promise.all([
    categoriesPromise,
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
        maxRedeemableAmount, 
        startDate, 
        expiryDate, 
        isActive 
    } = offerData;

   
    const category = await Category.findById(categoryId);
    if (!category) {
        throw new AppError(
            STATUS_CODES.NOT_FOUND,
            "NOT_FOUND",
            "Category not found"
        );
    }

   
    const start = new Date(startDate);
    const expiry = new Date(expiryDate);
    if (start >= expiry) {
        throw new AppError(
            STATUS_CODES.BAD_REQUEST,
            "INVALID_DATE",
            "Expiry date must be after the start date"
        );
    }


    const newOffer = {
        title,
        description: description || "",
        discountType,
        value,
        minTransactionalValue: minTransactionalValue || 0,
        maxRedeemableAmount: maxRedeemableAmount || null,
        startDate: start,
        expiryDate: expiry,
        isActive: isActive !== undefined ? isActive : true
    };


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

    category.offer = {
        isActive: offerData.isActive !== undefined ? offerData.isActive : true,
        title: offerData.title,
        description: offerData.description || "",
        discountType: offerData.discountType,
        value: offerData.value,
        minTransactionalValue: offerData.minTransactionalValue || 0,
        maxRedeemableAmount: offerData.maxRedeemableAmount || 0, 
        startDate: offerData.startDate,
        expiryDate: offerData.expiryDate
    };

    const updatedCategory = await category.save();
    
    logger.info(`Service: Offer updated successfully for category '${category.name}'`);
    
    return updatedCategory;
}

