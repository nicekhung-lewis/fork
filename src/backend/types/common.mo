module {
  /// Cross-cutting identifiers and primitives shared across every domain.
  public type UserId = Principal;
  public type JobId = Nat;
  public type OfferId = Nat;
  public type MessageId = Nat;
  public type ReviewId = Nat;
  public type Timestamp = Nat;

  /// A user's active role inside the marketplace. A single account can switch
  /// between hiring work and doing work.
  public type UserRole = {
    #client; // ผู้จ้างงาน — posts jobs
    #worker; // ผู้รับงาน — submits offers
  };

  /// Lifecycle of a job posting.
  public type JobStatus = {
    #open; // เปิดรับข้อเสนอ
    #inProgress; // กำลังทำ
    #completed; // เสร็จแล้ว
    #closed; // ปิด/ยกเลิก โดยผู้จ้าง
  };

  /// Lifecycle of an offer submitted by a worker.
  public type OfferStatus = {
    #pending; // รอพิจารณา
    #accepted; // ได้รับเลือก
    #rejected; // ไม่ได้รับเลือก
  };

  /// Fixed category list for job postings.
  public type Category = {
    #cleaning; // ทำความสะอาด
    #handyman; // ช่างซ่อม
    #delivery; // ขนส่ง/ส่งของ
    #assembly; // ประกอบเฟอร์นิเจอร์
    #gardening; // ดูแลสวน
    #moving; // ย้ายบ้าน
    #tutoring; // สอนพิเศษ
    #design; // ออกแบบ/กราฟิก
    #webDevelopment; // เขียนเว็บ/โปรแกรม
    #photography; // ถ่ายภาพ
    #events; // งานอีเวนต์
    #other; // อื่น ๆ
  };

  /// Inclusive price range in whole Thai Baht.
  public type PriceRange = {
    min : Nat;
    max : Nat;
  };

  /// Sort order for job search results.
  public type JobSort = {
    #newest; // ใหม่สุด
    #highestBudget; // งบสูงสุด
  };
};
